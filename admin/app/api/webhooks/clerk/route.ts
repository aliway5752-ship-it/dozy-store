
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
// In admin folder, prismadb is in @/lib/prismadb
import prismadb from '@/lib/prismadb'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses?.[0]?.email_address || ''
    const firstName = first_name || ''
    const lastName = last_name || ''
    const name = [first_name, last_name].filter(Boolean).join(' ') || ''
    const imageUrl = image_url || ''

    if (id && email) {
      try {
        // Here we're saving to 'Customer' in Prisma because there's no 'User' table by default
        // If the user adds a User table, they can replace 'customer' with 'user'.
        // Wait, I will use customer as it's the closest table, but the user explicitly said "جدول User في Prisma". I will look for User, but I only saw Customer. Let me double check if there's a User model.
        // Actually, schema.prisma does not have User, only Customer. 
        // Let's upsert into Customer.
        
         const newUser = await prismadb.user.upsert({
           where: { clerkId: id },
            update: {
              firstName: firstName,
              lastName: lastName,
              email: email,
              profileImageUrl: imageUrl,
            },
            create: {
              clerkId: id,
              firstName: firstName,
              lastName: lastName,
              email: email,
              profileImageUrl: imageUrl,
            },
         });

         // Create a cart for the new user
         await prismadb.cart.create({
           data: {
             userId: newUser.id,
           },
         });

         // Create a default address for the new user
         await prismadb.address.create({
            data: {
               userId: newUser.id,
               fullName: `${firstName} ${lastName}`.trim() || "Default Name",
               streetName: "",
               buildingNumber: "",
               city: "",
               governorate: "",
               isDefault: true,
            },
         });
      } catch (error) {
         console.error('Error saving user to DB:', error);
      }
    }
  }

  if (eventType === 'user.deleted') {
      const { id } = evt.data;
      if (id) {
        try {
          await prismadb.user.delete({
             where: { clerkId: id }
           });

           // Delete associated cart
           await prismadb.cart.delete({
             where: { userId: id }
           });

           // Delete associated addresses
           await prismadb.address.deleteMany({
             where: { userId: id }
           });

           // Delete associated wishlist items
           await prismadb.wishlist.deleteMany({
             where: { userId: id }
           });
        } catch (error) {
          console.error("Error deleting user:", error)
        }
      }
  }
}

import { Suspense } from "react";
import CartPage from "./page";

export const dynamic = 'force-dynamic';

export default function CartLayout() {
  return (
    <Suspense fallback={<div>Loading cart...</div>}>
      <CartPage />
    </Suspense>
  );
}

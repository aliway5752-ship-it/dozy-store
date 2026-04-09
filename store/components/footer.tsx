const Footer = () => {
    return (
        <footer className="bg-white border-t">
            <div className="py-10 mx-auto">
                <p className="text-xs text-center text-black uppercase tracking-[0.2em]">
                    &copy; 2026 <span className="font-bold">Dozy Store</span>. All rights reserved.
                </p>
                {/* سطر إضافي لحفظ حقوقك كمطور للموقع */}
                <p className="text-center text-[10px] text-neutral-400 mt-2 italic">
                    Developed by Ali Hussein
                </p>
            </div>
        </footer>
    )
}

export default Footer;
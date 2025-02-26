import RegisterForm from "@/components/FormContact";




export default function Contact() {
    return (
        <>
            <div className="relative w-full min-h-[80vh] pb-[10vh] overflow-hidden">
                <div className="fixed inset-0 z-0 w-full h-full opacity-100 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/gozamadridwp.jpg')",
                    }}>
                </div>
                <RegisterForm />
            </div>
        </>
    );
}





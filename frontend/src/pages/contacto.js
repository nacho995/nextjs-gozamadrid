import RegisterForm from "@/components/FormContact";




export default function Contact () {
    return (
        <>
        <div className="relative w-full min-h-[80vh] pb-[10vh] overflow-hidden">
        <div className="absolute inset-0 z-0 w-full h-full opacity-10"
                style={{
                    background: `
         repeating-linear-gradient(
           140deg,
           #ffffff,
           #ffffff 10vh,
           #000000 50vh,
           #C7A336  80vh
         )`
                }}>
            </div>
                <RegisterForm />
                </div>
        </>
    );
}





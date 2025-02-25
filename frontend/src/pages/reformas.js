import Reforms from "@/components/reformas/reforms";


export default function ReformsPage() {
    return (
        <div>
            <div
                className="fixed inset-0 z-0 opacity-100"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <Reforms/>
        </div>
    );
}
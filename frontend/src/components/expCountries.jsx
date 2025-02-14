"use client"

import AnimatedOnScroll from "./AnimatedScroll"


export default function ExpCountries() {
    return (
        <AnimatedOnScroll>
            <div className="grid grid-cols-4 gap-y-0 md:grid-cols-2 md:gap-x-0 md:gap-y-0 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-0">
                <div>
                    <div className="flex items-center justify-center h-full w-full bg-amarillo/20 rounded-lg">
                        <img src="/spain.jpg" alt="Spain" className="h-full w-full" />
                        <h3 className="absolute text-2xl font-bold text-center mt-4">Spain</h3>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-center h-full w-full bg-amarillo/20 rounded-lg">
                        <img src="/spain.jpg" alt="Spain" className="h-full w-full" />
                        <h3 className="absolute text-2xl font-bold text-center mt-4">Spain</h3>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-center h-full w-full bg-amarillo/20 rounded-lg">
                        <img src="/spain.jpg" alt="Spain" className="h-full w-full" />
                        <h3 className="absolute text-2xl font-bold text-center mt-4">Spain</h3>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-center h-full w-full bg-amarillo/20 rounded-lg">
                        <img src="/spain.jpg" alt="Spain" className="h-full w-full" />
                        <h3 className="absolute text-2xl font-bold text-center mt-4">Spain</h3>
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-center h-full w-full bg-amarillo/20 rounded-lg">
                        <img src="/spain.jpg" alt="Spain" className="h-full w-full" />
                        <h3 className="absolute text-2xl font-bold text-center mt-4">Spain</h3>
                    </div>
                </div>
            </div>
        </AnimatedOnScroll>
    )
}
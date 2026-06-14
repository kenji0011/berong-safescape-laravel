import React from "react";
import { Navigation } from "@/Components/navigation";
import { Footer } from "@/Components/footer";
import { FeedbackWidget } from "@/Components/FeedbackWidget";
import RootLayout from "./RootLayout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <RootLayout>
            <div className="min-h-screen relative flex flex-col">
                <Navigation />
                <div className="flex-1 w-full text-scalable relative z-10 pt-[104px] sm:pt-[120px]">
                    {children}
                </div>
                <div className="relative z-50">
                    <Footer />
                    <FeedbackWidget />
                </div>
            </div>
        </RootLayout>
    );
}

"use client";

import { useRouter } from "next/navigation";
import CreateBikerForm from "./CreateBikerForm";

export default function CreateBikerSection() {
    const router = useRouter();

    const handleSuccess = () => {
        // Refresh the page to show the new biker in the list
        router.refresh();
    };

    return <CreateBikerForm onSuccess={handleSuccess} />;
}

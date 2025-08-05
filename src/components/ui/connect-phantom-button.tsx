"use client";

import { Button } from "@/components/ui/button";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react"; // Using a generic wallet icon

export function ConnectPhantomButton() {
  const { setVisible } = useWalletModal();

  return (
    <Button
      onClick={() => setVisible(true)}
      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-lg uppercase tracking-wide rounded-sm shadow-[0_0_20px_rgba(147,51,234,0.3)]"
    >
      <Wallet className="w-5 h-5 mr-2" />
      CONNECT PHANTOM
    </Button>
  );
}


import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlocksTable from "@/components/BlocksTable";
import BlockchainStats from "@/components/BlockchainStats";

const Index = () => {
  // Set title
  useEffect(() => {
    document.title = "BlockView - Blockchain Explorer";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-blockchain-background text-blockchain-foreground">
      <Header />
      <main className="container mx-auto py-8 flex-grow">
        <BlockchainStats />
        <BlocksTable />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

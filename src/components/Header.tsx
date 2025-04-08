
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    // Check if it's a block number (only digits)
    if (/^\d+$/.test(searchQuery)) {
      const blockNumber = "0x" + parseInt(searchQuery).toString(16);
      navigate(`/block/${blockNumber}`);
      return;
    }

    // Check if it's an address (0x followed by 40 hex chars)
    if (/^0x[a-fA-F0-9]{40}$/.test(searchQuery)) {
      navigate(`/address/${searchQuery}`);
      return;
    }

    // Check if it's a transaction hash (0x followed by 64 hex chars)
    if (/^0x[a-fA-F0-9]{64}$/.test(searchQuery)) {
      navigate(`/tx/${searchQuery}`);
      return;
    }

    toast({
      title: "Invalid search",
      description: "Please enter a valid block number, address, or transaction hash",
      variant: "destructive",
    });
  };

  return (
    <header className="bg-blockchain-card border-b border-blockchain-border">
      <div className="container mx-auto py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <h1 
              className="text-2xl font-bold text-blockchain-primary cursor-pointer" 
              onClick={() => navigate("/")}
            >
              BlockView
            </h1>
            <span className="ml-2 text-sm text-blockchain-accent">Chain Explorer</span>
          </div>
          
          <form onSubmit={handleSearch} className="w-full md:w-2/3 flex">
            <Input
              type="text"
              placeholder="Search by Address / Tx Hash / Block"
              className="flex-grow bg-blockchain-background border-blockchain-border text-blockchain-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="ml-2 bg-blockchain-primary hover:bg-blockchain-secondary">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;

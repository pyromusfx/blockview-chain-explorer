
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, DollarSign, Hash, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { blockchainService } from "@/services/blockchainService";
import { formatEther, hexToNumber } from "@/utils/blockchainUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AddressInfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 py-3 border-b border-blockchain-border last:border-0">
    <span className="text-blockchain-foreground/60">{label}</span>
    <div className="md:col-span-2">{value}</div>
  </div>
);

const AddressPage = () => {
  const { address } = useParams();
  const [balance, setBalance] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [txCount, setTxCount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isContract, setIsContract] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Address ${address?.substring(0, 10)}... | BlockView`;
    
    const fetchAddressData = async () => {
      if (!address) return;
      
      try {
        const [balanceData, codeData, txCountData] = await Promise.all([
          blockchainService.getBalance(address),
          blockchainService.getCode(address),
          blockchainService.getTransactionCount(address),
        ]);
        
        setBalance(balanceData);
        setCode(codeData);
        setTxCount(txCountData);
        setIsContract(codeData !== "0x");
      } catch (error) {
        console.error("Failed to fetch address data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddressData();
  }, [address]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-blockchain-background text-blockchain-foreground">
      <Header />
      <main className="container mx-auto py-8 flex-grow">
        <Button 
          variant="outline" 
          className="mb-4 border-blockchain-border text-blockchain-foreground"
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="bg-blockchain-card border-blockchain-border">
          <CardHeader className="border-b border-blockchain-border">
            <div className="flex items-center gap-2">
              {isContract ? (
                <Code className="h-5 w-5 text-blockchain-accent" />
              ) : (
                <Wallet className="h-5 w-5 text-blockchain-accent" />
              )}
              <CardTitle>{isContract ? "Contract" : "Address"}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="py-3 border-b border-blockchain-border last:border-0">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))
            ) : (
              <>
                <AddressInfoItem 
                  label="Address" 
                  value={<span className="font-mono break-all">{address}</span>} 
                />
                <AddressInfoItem 
                  label="Balance" 
                  value={
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blockchain-muted" />
                      <span>{balance ? formatEther(balance) : "0"} ETH</span>
                    </div>
                  } 
                />
                <AddressInfoItem 
                  label="Transactions" 
                  value={
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-blockchain-muted" />
                      <span>{txCount ? hexToNumber(txCount) : "0"} txns</span>
                    </div>
                  } 
                />
                <AddressInfoItem 
                  label="Type" 
                  value={<span>{isContract ? "Contract" : "EOA (Externally Owned Account)"}</span>} 
                />
              </>
            )}
          </CardContent>
        </Card>

        {!loading && isContract && (
          <Card className="bg-blockchain-card border-blockchain-border mt-6">
            <CardHeader className="border-b border-blockchain-border">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blockchain-accent" />
                <CardTitle>Contract Bytecode</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="font-mono break-all text-sm bg-blockchain-background/50 p-3 rounded-md border border-blockchain-border overflow-x-auto max-h-96">
                {code}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AddressPage;

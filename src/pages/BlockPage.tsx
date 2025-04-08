
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Hexagon, Clock, LinkIcon, Wallet, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { blockchainService, Block } from "@/services/blockchainService";
import { formatTimestamp, formatGas, hexToNumber, shortenHash, shortenAddress } from "@/utils/blockchainUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BlockInfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 py-3 border-b border-blockchain-border last:border-0">
    <span className="text-blockchain-foreground/60">{label}</span>
    <div className="md:col-span-2">{value}</div>
  </div>
);

const BlockPage = () => {
  const { blockNumber } = useParams();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Block ${blockNumber} | BlockView`;
    
    const fetchBlock = async () => {
      if (!blockNumber) return;
      
      try {
        let formattedBlockNumber = blockNumber;
        
        // Convert decimal block number to hex if needed
        if (!blockNumber.startsWith('0x')) {
          formattedBlockNumber = '0x' + parseInt(blockNumber).toString(16);
        }
        
        const blockData = await blockchainService.getBlockByNumber(formattedBlockNumber, true);
        setBlock(blockData);
      } catch (error) {
        console.error("Failed to fetch block:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlock();
  }, [blockNumber]);

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
              <Hexagon className="h-5 w-5 text-blockchain-accent" />
              <CardTitle>Block {loading ? <Skeleton className="h-4 w-20 inline-block" /> : hexToNumber(block?.number || "")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="py-3 border-b border-blockchain-border last:border-0">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))
            ) : block ? (
              <>
                <BlockInfoItem 
                  label="Block Height" 
                  value={<span className="font-mono">{hexToNumber(block.number)}</span>} 
                />
                <BlockInfoItem 
                  label="Timestamp" 
                  value={
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-blockchain-muted" />
                      <span>{formatTimestamp(block.timestamp)}</span>
                    </div>
                  } 
                />
                <BlockInfoItem 
                  label="Transactions" 
                  value={
                    <div className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4 text-blockchain-muted" />
                      <span>{Array.isArray(block.transactions) ? block.transactions.length : 0} transactions</span>
                    </div>
                  } 
                />
                <BlockInfoItem 
                  label="Mined by" 
                  value={
                    <div className="flex items-center gap-1">
                      <Wallet className="h-4 w-4 text-blockchain-muted" />
                      <span 
                        className="text-blockchain-accent cursor-pointer hover:underline"
                        onClick={() => navigate(`/address/${block.miner}`)}
                      >
                        {block.miner}
                      </span>
                    </div>
                  } 
                />
                <BlockInfoItem 
                  label="Block Hash" 
                  value={<span className="font-mono break-all">{block.hash}</span>} 
                />
                <BlockInfoItem 
                  label="Parent Hash" 
                  value={
                    <span 
                      className="font-mono text-blockchain-accent cursor-pointer hover:underline break-all"
                      onClick={() => navigate(`/block/${block.parentHash}`)}
                    >
                      {block.parentHash}
                    </span>
                  } 
                />
                <BlockInfoItem 
                  label="Gas Used" 
                  value={<span>{formatGas(block.gasUsed)}</span>} 
                />
                <BlockInfoItem 
                  label="Gas Limit" 
                  value={<span>{formatGas(block.gasLimit)}</span>} 
                />
                <BlockInfoItem 
                  label="Nonce" 
                  value={<span className="font-mono">{block.nonce}</span>} 
                />
                <BlockInfoItem 
                  label="Size" 
                  value={
                    <div className="flex items-center gap-1">
                      <Server className="h-4 w-4 text-blockchain-muted" />
                      <span>{hexToNumber(block.size)} bytes</span>
                    </div>
                  } 
                />
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-blockchain-foreground/60">Block not found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!loading && block && Array.isArray(block.transactions) && block.transactions.length > 0 && (
          <Card className="bg-blockchain-card border-blockchain-border mt-6">
            <CardHeader className="border-b border-blockchain-border">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-blockchain-accent" />
                <CardTitle>Transactions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-2">
                {block.transactions.map((tx) => (
                  <div 
                    key={typeof tx === 'string' ? tx : tx.hash}
                    className="p-3 border border-blockchain-border rounded-md hover:bg-blockchain-background/50 cursor-pointer"
                    onClick={() => navigate(`/tx/${typeof tx === 'string' ? tx : tx.hash}`)}
                  >
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-blockchain-muted" />
                      <span className="text-blockchain-accent font-mono">
                        {typeof tx === 'string' ? shortenHash(tx) : shortenHash(tx.hash)}
                      </span>
                    </div>
                    {typeof tx !== 'string' && (
                      <div className="mt-2 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-blockchain-foreground/60">From:</span>
                          <span className="text-blockchain-accent">{shortenAddress(tx.from)}</span>
                        </div>
                        {tx.to && (
                          <div className="flex items-center gap-1">
                            <span className="text-blockchain-foreground/60">To:</span>
                            <span className="text-blockchain-accent">{shortenAddress(tx.to)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlockPage;


import { useState, useEffect } from "react";
import { Blocks, Hash, GasPump } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { blockchainService } from "@/services/blockchainService";
import { hexToNumber, formatBlockNumber } from "@/utils/blockchainUtils";

const BlockchainStats = () => {
  const [latestBlock, setLatestBlock] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const blockNumber = await blockchainService.getBlockNumber();
        setLatestBlock(blockNumber);
      } catch (error) {
        console.error("Failed to fetch blockchain stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-blockchain-card border-blockchain-border">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="bg-blockchain-primary/20 p-3 rounded-full">
            <Blocks className="h-6 w-6 text-blockchain-primary" />
          </div>
          <div>
            <p className="text-sm text-blockchain-foreground/60">Latest Block</p>
            {loading ? (
              <Skeleton className="h-6 w-28 mt-1" />
            ) : (
              <p className="text-xl font-semibold text-blockchain-foreground">
                {latestBlock ? formatBlockNumber(latestBlock) : "N/A"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blockchain-card border-blockchain-border">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="bg-blockchain-accent/20 p-3 rounded-full">
            <Hash className="h-6 w-6 text-blockchain-accent" />
          </div>
          <div>
            <p className="text-sm text-blockchain-foreground/60">Network</p>
            <p className="text-xl font-semibold text-blockchain-foreground">Custom Chain</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blockchain-card border-blockchain-border">
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="bg-blockchain-muted/20 p-3 rounded-full">
            <GasPump className="h-6 w-6 text-blockchain-muted" />
          </div>
          <div>
            <p className="text-sm text-blockchain-foreground/60">Node URL</p>
            <p className="text-xl font-semibold text-blockchain-foreground truncate max-w-[180px]">
              134.209.225.50:8545
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlockchainStats;

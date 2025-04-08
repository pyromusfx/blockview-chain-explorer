
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Hexagon, Wallet } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { blockchainService, Block } from "@/services/blockchainService";
import { 
  shortenAddress, 
  shortenHash, 
  formatTimestamp, 
  formatGas, 
  hexToNumber, 
  formatBlockNumber 
} from "@/utils/blockchainUtils";

const BlocksTable = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const latestBlocks = await blockchainService.getLatestBlocks(10);
        setBlocks(latestBlocks);
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  return (
    <Card className="bg-blockchain-card border-blockchain-border">
      <CardHeader className="border-b border-blockchain-border pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Hexagon className="h-5 w-5 text-blockchain-accent" />
          Latest Blocks
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-blockchain-background/50">
              <TableHead className="w-[100px]">Block</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Txns</TableHead>
              <TableHead>Miner</TableHead>
              <TableHead className="text-right">Gas Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                </TableRow>
              ))
            ) : blocks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">No blocks found</TableCell>
              </TableRow>
            ) : (
              blocks.map((block) => (
                <TableRow 
                  key={block.hash} 
                  className="hover:bg-blockchain-background/50 cursor-pointer"
                  onClick={() => navigate(`/block/${block.number}`)}
                >
                  <TableCell className="font-medium text-blockchain-primary">
                    {formatBlockNumber(block.number)}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blockchain-muted" />
                    {formatTimestamp(block.timestamp)}
                  </TableCell>
                  <TableCell>
                    {Array.isArray(block.transactions) 
                      ? block.transactions.length 
                      : hexToNumber(block.transactions as unknown as string)}
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-blockchain-muted" />
                    <span className="text-blockchain-accent">{shortenAddress(block.miner)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatGas(block.gasUsed)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BlocksTable;

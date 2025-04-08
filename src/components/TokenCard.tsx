
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, ExternalLink } from "lucide-react";
import { Token } from "@/services/tokenService";
import { formatEther } from "@/utils/blockchainUtils";

interface TokenCardProps {
  token: Token;
}

const TokenCard = ({ token }: TokenCardProps) => {
  return (
    <Card className="bg-blockchain-card border-blockchain-border blockchain-card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blockchain-primary/20 p-2 rounded-full mr-2">
              <Coins className="h-5 w-5 text-blockchain-primary" />
            </div>
            {token.name || "Unknown Token"}
          </div>
          <Badge variant="outline" className="border-blockchain-primary/30 bg-blockchain-primary/10 text-blockchain-primary font-medium">
            {token.symbol}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blockchain-foreground/70">Decimals:</span>
            <span className="font-medium">{token.decimals}</span>
          </div>
          
          {token.totalSupply && (
            <div className="flex justify-between">
              <span className="text-blockchain-foreground/70">Total Supply:</span>
              <span className="font-medium">{formatEther(token.totalSupply)}</span>
            </div>
          )}
          
          {token.balance && (
            <div className="flex justify-between">
              <span className="text-blockchain-foreground/70">Balance:</span>
              <span className="font-medium">{formatEther(token.balance)}</span>
            </div>
          )}
          
          <div className="pt-2 flex justify-between items-center border-t border-blockchain-border mt-2">
            <span className="text-blockchain-foreground/70">Contract:</span>
            <a
              href={`/address/${token.address}`}
              className="font-mono text-xs hover:text-blockchain-primary transition-colors flex items-center"
            >
              {token.address.slice(0, 6)}...{token.address.slice(-4)}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenCard;

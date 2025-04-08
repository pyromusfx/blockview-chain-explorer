
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tokenService, Token } from "@/services/tokenService";
import { formatEther } from "@/utils/blockchainUtils";

const TokensPage = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Tokens - BlockView Explorer";
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const commonTokens = await tokenService.getCommonTokens();
      setTokens(commonTokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchToken = async () => {
    if (!searchAddress || !searchAddress.startsWith("0x")) {
      return;
    }

    setLoading(true);
    
    try {
      const tokenInfo = await tokenService.getTokenInfo(searchAddress);
      
      if (tokenInfo) {
        // Add to the list if not already present
        setTokens(prevTokens => {
          const exists = prevTokens.some(t => t.address.toLowerCase() === searchAddress.toLowerCase());
          return exists ? prevTokens : [tokenInfo, ...prevTokens];
        });
      }
    } catch (error) {
      console.error("Error searching for token:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-blockchain-background text-blockchain-foreground">
      <Header />
      <main className="container mx-auto py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-blockchain-foreground">Token Explorer</h1>
          <p className="text-blockchain-foreground/70">
            View information about tokens on the blockchain
          </p>
        </div>

        <Card className="mb-6 bg-blockchain-card border-blockchain-border">
          <CardHeader>
            <CardTitle className="text-xl">Search for Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Token Contract Address (0x...)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="flex-grow bg-blockchain-background border-blockchain-border text-blockchain-foreground"
              />
              <Button 
                onClick={handleSearchToken} 
                className="bg-blockchain-primary hover:bg-blockchain-secondary"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blockchain-card border-blockchain-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5" />
              Token List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-blockchain-border">
                <Table>
                  <TableHeader className="bg-blockchain-background/50">
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Decimals</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-blockchain-foreground/70">
                          No tokens found. Search for a token by its contract address.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tokens.map((token) => (
                        <TableRow key={token.address} className="hover:bg-blockchain-background/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="bg-blockchain-primary/20 p-2 rounded-full mr-2">
                                <Coins className="h-5 w-5 text-blockchain-primary" />
                              </div>
                              {token.name || "Unknown Token"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-blockchain-primary/30 bg-blockchain-primary/10 text-blockchain-primary font-medium">
                              {token.symbol || "???"}
                            </Badge>
                          </TableCell>
                          <TableCell>{token.decimals}</TableCell>
                          <TableCell className="font-mono text-sm">
                            <a
                              href={`/address/${token.address}`}
                              className="hover:text-blockchain-primary transition-colors"
                            >
                              {token.address.slice(0, 8)}...{token.address.slice(-6)}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blockchain-border hover:bg-blockchain-primary/20 hover:text-blockchain-primary"
                              onClick={() => navigate(`/address/${token.address}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TokensPage;

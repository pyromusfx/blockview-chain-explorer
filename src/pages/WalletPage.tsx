
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Copy, RefreshCw, Shield, Eye, EyeOff, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createWallet } from "@/services/walletService";
import { Label } from "@/components/ui/label";

const WalletPage = () => {
  const [wallet, setWallet] = useState<{
    address: string;
    privateKey: string;
    mnemonic: string;
  } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const handleCreateWallet = async () => {
    if (password !== passwordConfirm) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const newWallet = await createWallet(password);
      setWallet(newWallet);
      toast({
        title: "Wallet created successfully",
        description: "Make sure to save your mnemonic phrase and private key securely",
      });
    } catch (error) {
      toast({
        title: "Failed to create wallet",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard`,
      description: "You can now paste it elsewhere",
    });
  };

  const downloadWalletInfo = () => {
    if (!wallet) return;

    const walletInfo = `
Wallet Address: ${wallet.address}
Private Key: ${wallet.privateKey}
Mnemonic Phrase: ${wallet.mnemonic}
    
IMPORTANT: Keep this information secure and never share it with anyone.
    `;

    const blob = new Blob([walletInfo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallet-${wallet.address.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Wallet info downloaded",
      description: "Store it in a secure location",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-blockchain-primary">Wallet Creator</h1>

        {!wallet ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Create a New Wallet</CardTitle>
              <CardDescription>
                Generate a new Ethereum wallet with private key and mnemonic phrase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Encryption Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  This password will be used to encrypt your wallet's private key
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirm Password</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  placeholder="Confirm your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleCreateWallet}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create New Wallet
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Your New Wallet</CardTitle>
                <CardDescription>
                  Keep this information secure and never share it with anyone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Wallet Address</Label>
                  <div className="flex">
                    <Input value={wallet.address} readOnly className="flex-1" />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard(wallet.address, "Address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Private Key</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? (
                        <EyeOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      {showPrivateKey ? "Hide" : "Show"}
                    </Button>
                  </Label>
                  <div className="flex">
                    <Input
                      type={showPrivateKey ? "text" : "password"}
                      value={showPrivateKey ? wallet.privateKey : "•".repeat(20)}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard(wallet.privateKey, "Private Key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mnemonic Phrase</Label>
                  <Textarea
                    value={wallet.mnemonic}
                    readOnly
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setWallet(null)}
                >
                  Create Another
                </Button>
                <Button
                  variant="default"
                  onClick={downloadWalletInfo}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save Wallet Info
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wallet Security</CardTitle>
                <CardDescription>
                  Important information about keeping your wallet secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <h3 className="font-medium text-amber-800 mb-2">Security Warning</h3>
                  <ul className="text-sm text-amber-700 space-y-2">
                    <li>• Never share your private key or mnemonic phrase with anyone</li>
                    <li>• Store your recovery information in a secure location</li>
                    <li>• Be aware of phishing attempts and scams</li>
                    <li>• Consider using hardware wallets for large amounts</li>
                    <li>• Make sure to download and securely store your wallet information</li>
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Next Steps</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>1. Save your wallet information securely</li>
                    <li>2. Add funds to your new wallet</li>
                    <li>3. Explore the blockchain using your new address</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WalletPage;

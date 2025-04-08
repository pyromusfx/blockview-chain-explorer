
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Receipt, DollarSign, Fuel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { blockchainService, Transaction, TransactionReceipt } from "@/services/blockchainService";
import { formatTimestamp, formatGas, hexToNumber, formatEther, formatGwei } from "@/utils/blockchainUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TransactionInfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 py-3 border-b border-blockchain-border last:border-0">
    <span className="text-blockchain-foreground/60">{label}</span>
    <div className="md:col-span-2">{value}</div>
  </div>
);

const TransactionPage = () => {
  const { txHash } = useParams();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Transaction ${txHash?.substring(0, 10)}... | BlockView`;
    
    const fetchTransaction = async () => {
      if (!txHash) return;
      
      try {
        const [txData, receiptData] = await Promise.all([
          blockchainService.getTransaction(txHash),
          blockchainService.getTransactionReceipt(txHash),
        ]);
        
        setTransaction(txData);
        setReceipt(receiptData);
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [txHash]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const getTxStatus = () => {
    if (!receipt) return null;
    
    const status = receipt.status === "0x1";
    
    return (
      <Badge
        className={status ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}
      >
        {status ? "Success" : "Failed"}
      </Badge>
    );
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blockchain-accent" />
                <CardTitle>Transaction Details</CardTitle>
              </div>
              {!loading && getTxStatus()}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              Array(8).fill(0).map((_, index) => (
                <div key={index} className="py-3 border-b border-blockchain-border last:border-0">
                  <Skeleton className="h-5 w-full" />
                </div>
              ))
            ) : transaction ? (
              <>
                <TransactionInfoItem 
                  label="Transaction Hash" 
                  value={<span className="font-mono break-all">{transaction.hash}</span>} 
                />
                <TransactionInfoItem 
                  label="Block" 
                  value={
                    <span 
                      className="font-mono text-blockchain-accent cursor-pointer hover:underline"
                      onClick={() => navigate(`/block/${transaction.blockNumber}`)}
                    >
                      {hexToNumber(transaction.blockNumber)}
                    </span>
                  } 
                />
                {receipt && (
                  <TransactionInfoItem 
                    label="Timestamp" 
                    value={
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blockchain-muted" />
                        <span>{receipt.blockNumber ? "Confirmed" : "Pending"}</span>
                      </div>
                    } 
                  />
                )}
                <TransactionInfoItem 
                  label="From" 
                  value={
                    <span 
                      className="font-mono text-blockchain-accent cursor-pointer hover:underline break-all"
                      onClick={() => navigate(`/address/${transaction.from}`)}
                    >
                      {transaction.from}
                    </span>
                  } 
                />
                <TransactionInfoItem 
                  label="To" 
                  value={
                    transaction.to ? (
                      <span 
                        className="font-mono text-blockchain-accent cursor-pointer hover:underline break-all"
                        onClick={() => navigate(`/address/${transaction.to}`)}
                      >
                        {transaction.to}
                      </span>
                    ) : (
                      <span className="text-blockchain-foreground/60 italic">Contract Creation</span>
                    )
                  } 
                />
                {receipt?.contractAddress && (
                  <TransactionInfoItem 
                    label="Contract Created" 
                    value={
                      <span 
                        className="font-mono text-blockchain-accent cursor-pointer hover:underline break-all"
                        onClick={() => navigate(`/address/${receipt.contractAddress}`)}
                      >
                        {receipt.contractAddress}
                      </span>
                    } 
                  />
                )}
                <TransactionInfoItem 
                  label="Value" 
                  value={
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-blockchain-muted" />
                      <span>{formatEther(transaction.value)} ETH</span>
                    </div>
                  } 
                />
                <TransactionInfoItem 
                  label="Transaction Fee" 
                  value={
                    <div className="flex items-center gap-1">
                      <Fuel className="h-4 w-4 text-blockchain-muted" />
                      {receipt ? (
                        <span>
                          {formatEther(
                            "0x" + (
                              BigInt(receipt.gasUsed) * 
                              BigInt(transaction.gasPrice)
                            ).toString(16)
                          )} ETH
                        </span>
                      ) : (
                        <span className="text-blockchain-foreground/60 italic">Pending</span>
                      )}
                    </div>
                  } 
                />
                <TransactionInfoItem 
                  label="Gas Price" 
                  value={<span>{formatGwei(transaction.gasPrice)} Gwei</span>} 
                />
                <TransactionInfoItem 
                  label="Gas Limit" 
                  value={<span>{formatGas(transaction.gas)}</span>} 
                />
                {receipt && (
                  <TransactionInfoItem 
                    label="Gas Used" 
                    value={<span>{formatGas(receipt.gasUsed)} ({Math.round(hexToNumber(receipt.gasUsed) / hexToNumber(transaction.gas) * 100)}%)</span>} 
                  />
                )}
                <TransactionInfoItem 
                  label="Nonce" 
                  value={<span className="font-mono">{hexToNumber(transaction.nonce)}</span>} 
                />
                {transaction.input && transaction.input !== "0x" && (
                  <TransactionInfoItem 
                    label="Input Data" 
                    value={
                      <div className="font-mono break-all text-sm bg-blockchain-background/50 p-3 rounded-md border border-blockchain-border overflow-x-auto">
                        {transaction.input}
                      </div>
                    } 
                  />
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="text-blockchain-foreground/60">Transaction not found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TransactionPage;

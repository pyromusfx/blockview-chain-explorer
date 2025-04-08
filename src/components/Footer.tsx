
import { Github } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-blockchain-card border-t border-blockchain-border py-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-blockchain-foreground/60">
            <p>© 2025 BlockView Chain Explorer</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <div className="flex items-center space-x-2 text-sm text-blockchain-foreground/60">
              <span>Node:</span>
              <span className="text-blockchain-primary">http://134.209.225.50:8545</span>
            </div>
            <div className="flex items-center">
              <a 
                href="#" 
                className="text-blockchain-foreground/60 hover:text-blockchain-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

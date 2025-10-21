import { Button } from "@/components/ui/button";

interface RegisterCTAProps {
  className?: string;
  variant?: "default" | "cta";
}

const RegisterCTA = ({ className = "", variant = "cta" }: RegisterCTAProps) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Button asChild variant={variant} size="lg">
        <a href="/register">Register now</a>
      </Button>
    </div>
  );
};

export default RegisterCTA;
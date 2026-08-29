import { User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function Feature() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Platform</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left text-text-primary">
                Something new!
              </h2>
              <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                Managing a small business today is already tough.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-8">
            <div className="bg-muted rounded-md h-full min-w-[280px] flex-[2_1_280px] p-6 aspect-square lg:aspect-auto flex justify-between flex-col">
              <User className="w-8 h-8 stroke-[1.5]" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-text-primary">Pay supplier invoices</h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-md min-w-[280px] flex-1 basis-[280px] aspect-square p-6 flex justify-between flex-col">
              <User className="w-8 h-8 stroke-[1.5]" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-text-primary">Pay supplier invoices</h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-md min-w-[280px] flex-1 basis-[280px] aspect-square p-6 flex justify-between flex-col">
              <User className="w-8 h-8 stroke-[1.5]" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-text-primary">Pay supplier invoices</h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>
            <div className="bg-muted rounded-md h-full min-w-[280px] flex-[2_1_280px] p-6 aspect-square lg:aspect-auto flex justify-between flex-col">
              <User className="w-8 h-8 stroke-[1.5]" />
              <div className="flex flex-col">
                <h3 className="text-xl tracking-tight text-text-primary">Pay supplier invoices</h3>
                <p className="text-muted-foreground max-w-xs text-base">
                  Our goal is to streamline SMB trade, making it easier and faster than ever.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };

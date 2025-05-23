import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen relative">
      <menu className="flex items-center p-4 absolute">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full">
            <SheetHeader>
              <SheetTitle>History</SheetTitle>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </menu>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

export function buttonVariants({ variant, size, className } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
    variant === "link" && "text-primary underline-offset-4 hover:underline",
    size === "default" && "h-10 px-4 py-2",
    size === "sm" && "h-9 rounded-md px-3",
    size === "lg" && "h-11 rounded-md px-8",
    size === "icon" && "h-10 w-10",
    className
  );
}

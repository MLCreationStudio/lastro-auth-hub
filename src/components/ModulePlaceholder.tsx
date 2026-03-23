import { Link } from 'react-router-dom';

type ModulePlaceholderProps = {
  title: string;
  subtitle: string;
};

const ModulePlaceholder = ({ title, subtitle }: ModulePlaceholderProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="flex max-w-xl flex-col items-center">
        <h1 className="text-[24px] font-medium leading-tight text-primary">{title}</h1>
        <p className="mt-4 text-base italic text-muted-foreground">{subtitle}</p>
        <Link
          to="/dashboard"
          className="mt-8 text-sm text-muted-foreground transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
        >
          ← voltar ao início
        </Link>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
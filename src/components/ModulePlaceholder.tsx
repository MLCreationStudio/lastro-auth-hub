import { Link } from 'react-router-dom';

type ModulePlaceholderProps = {
  title: string;
  subtitle: string;
};

const ModulePlaceholder = ({ title, subtitle }: ModulePlaceholderProps) => {
  return (
    <div className="min-h-screen bg-background px-6 py-8 md:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <p className="font-display text-[18px] italic text-primary">Lastro.</p>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="font-display text-[30px] leading-none text-primary md:text-[32px]">{title}</h1>
          <p className="mt-4 font-display text-base italic leading-[1.5] text-secondary">{subtitle}</p>
          <Link
            to="/dashboard"
            className="mt-8 text-[12px] text-[hsl(var(--foreground)/0.25)] transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.98]"
          >
            ← voltar
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
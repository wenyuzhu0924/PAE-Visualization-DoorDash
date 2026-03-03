import { Badge } from '@/components/ui/badge';
import { Users, ShoppingBag, Truck, Headphones, Cpu } from 'lucide-react';
import { COMPANY_COLORS, type Company, type Domain } from '@/lib/data';

interface CompanyChipsProps {
  companies: readonly Company[];
  selected: Company[];
  onToggle: (company: Company) => void;
  highlighted?: Company | null;
  onHighlight?: (company: Company | null) => void;
}

export function CompanyChips({ companies, selected, onToggle, highlighted, onHighlight }: CompanyChipsProps) {
  return (
    <div className="flex flex-wrap gap-1" data-testid="company-chips">
      {companies.map(company => {
        const isSelected = selected.includes(company);
        const isHighlighted = highlighted === company;
        const color = COMPANY_COLORS[company];
        return (
          <Badge
            key={company}
            data-testid={`chip-company-${company.replace(/\s/g, '-')}`}
            className="cursor-pointer select-none transition-all duration-200 text-[10px] px-1.5 py-0.5"
            variant={isSelected ? 'default' : 'outline'}
            style={{
              backgroundColor: isSelected ? color + '15' : 'transparent',
              color: isSelected ? color : 'hsl(215 20% 35%)',
              borderColor: isSelected ? color + '30' : 'hsl(220 20% 14%)',
              boxShadow: isHighlighted ? `0 0 12px ${color}40` : 'none',
            }}
            onClick={() => onToggle(company)}
            onMouseEnter={() => onHighlight?.(company)}
            onMouseLeave={() => onHighlight?.(null)}
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}60` }} />
            {company}
          </Badge>
        );
      })}
    </div>
  );
}

interface DomainChipsProps {
  domains: readonly Domain[];
  selected: Domain[];
  onToggle: (domain: Domain) => void;
}

const DOMAIN_ICON_MAP: Record<Domain, typeof Users> = {
  'Consumer AI': Users,
  'Merchant AI': ShoppingBag,
  'Dispatch AI': Truck,
  'Support AI': Headphones,
  'Autonomous Hardware': Cpu,
};

export function DomainChips({ domains, selected, onToggle }: DomainChipsProps) {
  return (
    <div className="flex flex-wrap gap-1" data-testid="domain-chips">
      {domains.map(domain => {
        const isSelected = selected.includes(domain);
        const Icon = DOMAIN_ICON_MAP[domain];
        return (
          <Badge
            key={domain}
            data-testid={`chip-domain-${domain.replace(/\s/g, '-')}`}
            className="cursor-pointer select-none transition-all duration-200 text-[10px] px-1.5 py-0.5"
            variant={isSelected ? 'default' : 'outline'}
            style={{
              backgroundColor: isSelected ? 'hsl(192 85% 50% / 0.10)' : 'transparent',
              color: isSelected ? 'hsl(192 85% 60%)' : 'hsl(215 20% 35%)',
              borderColor: isSelected ? 'hsl(192 85% 50% / 0.25)' : 'hsl(220 20% 14%)',
            }}
            onClick={() => onToggle(domain)}
          >
            <Icon className="w-2.5 h-2.5 mr-1 opacity-60" />
            {domain.replace(' AI', '').replace('Autonomous ', '')}
          </Badge>
        );
      })}
    </div>
  );
}

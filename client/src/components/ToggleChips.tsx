import { Badge } from '@/components/ui/badge';
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
    <div className="flex flex-wrap gap-2" data-testid="company-chips">
      {companies.map(company => {
        const isSelected = selected.includes(company);
        const isHighlighted = highlighted === company;
        const color = COMPANY_COLORS[company];
        return (
          <Badge
            key={company}
            data-testid={`chip-company-${company.replace(/\s/g, '-')}`}
            className="cursor-pointer select-none transition-all duration-200"
            variant={isSelected ? 'default' : 'outline'}
            style={{
              backgroundColor: isSelected ? color : 'transparent',
              color: isSelected ? '#fff' : color,
              borderColor: color,
              opacity: isSelected ? 1 : 0.5,
              outline: isHighlighted ? `2px solid ${color}` : 'none',
              outlineOffset: '2px',
            }}
            onClick={() => onToggle(company)}
            onMouseEnter={() => onHighlight?.(company)}
            onMouseLeave={() => onHighlight?.(null)}
          >
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

const DOMAIN_ICONS: Record<Domain, string> = {
  'Consumer AI': 'U',
  'Merchant AI': 'M',
  'Dispatch AI': 'D',
  'Support AI': 'S',
  'Autonomous Hardware': 'H',
};

export function DomainChips({ domains, selected, onToggle }: DomainChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="domain-chips">
      {domains.map(domain => {
        const isSelected = selected.includes(domain);
        return (
          <Badge
            key={domain}
            data-testid={`chip-domain-${domain.replace(/\s/g, '-')}`}
            className="cursor-pointer select-none transition-all duration-200"
            variant={isSelected ? 'default' : 'outline'}
            style={{
              opacity: isSelected ? 1 : 0.5,
            }}
            onClick={() => onToggle(domain)}
          >
            <span className="font-mono text-xs mr-1 opacity-60">{DOMAIN_ICONS[domain]}</span>
            {domain}
          </Badge>
        );
      })}
    </div>
  );
}

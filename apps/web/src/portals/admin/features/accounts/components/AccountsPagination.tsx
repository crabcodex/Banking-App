import { Button } from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AccountsPaginationProps {
  total: number;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
}

export function AccountsPagination({ total, limit, offset, onPageChange }: AccountsPaginationProps) {
  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-text-secondary">
        Mostrando {offset + 1}-{Math.min(offset + limit, total)} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(offset - limit)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs text-text-secondary">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(offset + limit)}
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

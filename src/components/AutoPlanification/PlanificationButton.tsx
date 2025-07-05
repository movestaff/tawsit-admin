//PlanificationButton.tsx

import Card from "../../components/ui/card";
import { Button } from "../../components/ui/button";

type PlanificationButtonProps = {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
};

export default function PlanificationButton({
  onClick,
  loading,
  disabled,
}: PlanificationButtonProps) {
  return (
    <Card className="flex justify-center">
      <Button
        onClick={onClick}
        disabled={disabled || loading}
        className="w-full max-w-sm"
      >
        {loading ? 'Planification en cours...' : 'Lancer la planification'}
      </Button>
    </Card>
  );
}

import { memo, useState, type Dispatch } from "react";
import type { ChecklistItem } from "../data/checklist.ts";
import type { Action, Answer, Status } from "../lib/inspection.ts";
import { Icon, type IconName } from "./Icon.tsx";
import { ProblemEditor } from "./ProblemEditor.tsx";

const STATUS_BUTTONS: { status: Status; label: string; icon: IconName }[] = [
  { status: "ok", label: "OK", icon: "check" },
  { status: "problem", label: "Problem", icon: "alert" },
  { status: "na", label: "Not applicable", icon: "minus" },
];

interface Props {
  item: ChecklistItem;
  itemKey: string;
  answer: Answer | undefined;
  showTips: boolean;
  dispatch: Dispatch<Action>;
}

export const ItemCard = memo(function ItemCard({
  item,
  itemKey,
  answer,
  showTips,
  dispatch,
}: Props) {
  const [tipOpen, setTipOpen] = useState(false);
  const status = answer?.status;
  const titleId = `title-${itemKey}`;

  return (
    <article
      className={`item item--${status ?? "open"}`}
      aria-labelledby={titleId}
    >
      <div className="item__head">
        <span className="code">{item.code}</span>
        <h3 id={titleId}>{item.title}</h3>
      </div>

      {showTips || tipOpen ? (
        <p className="tip">
          <Icon name="bulb" size={17} />
          <span>{item.howToCheck}</span>
        </p>
      ) : (
        <p className="tip">
          <button
            type="button"
            className="link small"
            onClick={() => setTipOpen(true)}
          >
            How to check
          </button>
        </p>
      )}

      <div className="status" role="group" aria-labelledby={titleId}>
        {STATUS_BUTTONS.map((b) => (
          <button
            key={b.status}
            type="button"
            className={`status__${b.status}`}
            aria-pressed={status === b.status}
            onClick={() =>
              dispatch({
                type: "setStatus",
                key: itemKey,
                // Tapping the chosen answer again clears it.
                status: status === b.status ? undefined : b.status,
              })
            }
          >
            {status === b.status && <Icon name={b.icon} size={16} />}
            {b.label}
          </button>
        ))}
      </div>

      {status === "problem" && (
        <ProblemEditor itemKey={itemKey} answer={answer!} dispatch={dispatch} />
      )}
    </article>
  );
});

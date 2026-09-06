import { useTranslation } from "react-i18next";
import { CLASSES_BY_ID } from "@/content/classes";
import { FEATS_BY_ID } from "@/content/feats";
import { RACES_BY_ID } from "@/content/races";
import { SKILLS, SKILLS_BY_ID } from "@/content/skills";
import { deriveSkillTotals } from "@/domain/character/calculations";
import type { PlayerCharacter } from "@/domain/character/types";
import { NumberInput } from "@/presentation/components/fields";

interface SkillsTabProps {
  character: PlayerCharacter;
  onChange: (updater: (character: PlayerCharacter) => PlayerCharacter) => void;
}

export function SkillsTab({ character, onChange }: SkillsTabProps) {
  const { t } = useTranslation();
  const totals = deriveSkillTotals(character, CLASSES_BY_ID, SKILLS_BY_ID, RACES_BY_ID, FEATS_BY_ID);
  const totalsBySkillId = Object.fromEntries(totals.map((total) => [total.skillId, total]));

  function updateSkill(skillId: string, patch: Partial<{ ranks: number; miscModifier: number }>) {
    onChange((c) => ({
      ...c,
      skills: c.skills.map((s) => (s.skillId === skillId ? { ...s, ...patch } : s)),
    }));
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="py-2 pr-2">{t("characterSheet.skills.skill")}</th>
            <th className="px-2 py-2 text-center">{t("characterSheet.skills.classSkill")}</th>
            <th className="px-2 py-2 text-center">{t("characterSheet.skills.ranks")}</th>
            <th className="px-2 py-2 text-center">{t("characterSheet.skills.misc")}</th>
            <th className="px-2 py-2 text-center">{t("characterSheet.skills.total")}</th>
          </tr>
        </thead>
        <tbody>
          {SKILLS.map((skillDef) => {
            const skillState = character.skills.find((s) => s.skillId === skillDef.id);
            const total = totalsBySkillId[skillDef.id];
            return (
              <tr key={skillDef.id} className="border-b border-border/60">
                <td className="py-1.5 pr-2">
                  {t(skillDef.nameKey)}
                  {skillDef.trainedOnly ? (
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      ({t("characterSheet.skills.trainedOnly")})
                    </span>
                  ) : null}
                </td>
                <td className="px-2 py-1.5 text-center">{total?.isClassSkill ? "✓" : ""}</td>
                <td className="px-2 py-1.5">
                  <NumberInput
                    aria-label={t("characterSheet.skills.ranks")}
                    min={0}
                    value={skillState?.ranks ?? 0}
                    onChange={(e) => updateSkill(skillDef.id, { ranks: Number(e.target.value) })}
                    className="!w-16 text-center"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <NumberInput
                    aria-label={t("characterSheet.skills.misc")}
                    value={skillState?.miscModifier ?? 0}
                    onChange={(e) => updateSkill(skillDef.id, { miscModifier: Number(e.target.value) })}
                    className="!w-16 text-center"
                  />
                </td>
                <td className="px-2 py-1.5 text-center font-semibold">{total?.total ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

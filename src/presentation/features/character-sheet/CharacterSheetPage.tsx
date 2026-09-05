import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCharacterStore } from "@/application/stores/characterStore";
import { exportCharacterToFile } from "@/application/useCases/exportCharacterToFile";
import { Button } from "@/presentation/components/Button";
import { useConfirm } from "@/presentation/components/ConfirmProvider";
import { StatusBanner, useStatusMessage } from "@/presentation/components/StatusBanner";
import { Tabs, type TabItem } from "@/presentation/components/Tabs";
import { AbilitiesTab } from "./AbilitiesTab";
import { CombatTab } from "./CombatTab";
import { CompanionsTab } from "./CompanionsTab";
import { FeatsTab } from "./FeatsTab";
import { InventoryTab } from "./InventoryTab";
import { NotesTab } from "./NotesTab";
import { ProfileTab } from "./ProfileTab";
import { SkillsTab } from "./SkillsTab";
import { SpellsTab } from "./SpellsTab";
import { useCharacterEditor } from "./useCharacterEditor";

const DEFAULT_TAB = "profile";

export function CharacterSheetPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { message, setMessage } = useStatusMessage();
  const [searchParams, setSearchParams] = useSearchParams();

  const { character, update } = useCharacterEditor();
  const companions = useCharacterStore((s) => s.companions);
  const removeCharacter = useCharacterStore((s) => s.removeCharacter);

  const activeTab = searchParams.get("tab") ?? DEFAULT_TAB;

  if (!character) {
    return (
      <div>
        <p className="mb-3 text-sm text-muted-foreground">{t("status.noCharacters")}</p>
        <Link to="/" className="text-sm underline">
          {t("actions.back")}
        </Link>
      </div>
    );
  }

  const tabs: TabItem[] = [
    { id: "profile", label: t("characterSheet.tabs.profile") },
    { id: "abilities", label: t("characterSheet.tabs.abilities") },
    { id: "combat", label: t("characterSheet.tabs.combat") },
    { id: "skills", label: t("characterSheet.tabs.skills") },
    { id: "feats", label: t("characterSheet.tabs.feats") },
    { id: "inventory", label: t("characterSheet.tabs.inventory") },
    { id: "spells", label: t("characterSheet.tabs.spells") },
    { id: "companions", label: t("characterSheet.tabs.companions") },
    { id: "notes", label: t("characterSheet.tabs.notes") },
  ];

  function handleExport() {
    if (!character) return;
    exportCharacterToFile(character, companions);
    setMessage({ kind: "success", text: t("status.exported") });
  }

  async function handleDelete() {
    if (!character) return;
    const confirmed = await confirm({
      title: t("confirm.deleteCharacterTitle"),
      body: t("confirm.deleteCharacterBody", { name: character.name }),
      confirmLabel: t("actions.delete"),
      destructive: true,
    });
    if (confirmed) {
      removeCharacter(character.id);
      navigate("/");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/" className="text-xs text-muted-foreground underline">
            {t("actions.back")}
          </Link>
          <h1 className="text-xl font-semibold">{character.name}</h1>
          <p className="text-xs text-muted-foreground">{t("status.autosaveOn")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            {t("actions.export")}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      <StatusBanner message={message} />

      <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setSearchParams({ tab: id })} />

      <div className="rounded-b-md border border-t-0 border-border bg-card p-4">
        {activeTab === "profile" && <ProfileTab character={character} onChange={update} />}
        {activeTab === "abilities" && <AbilitiesTab character={character} onChange={update} />}
        {activeTab === "combat" && <CombatTab character={character} onChange={update} />}
        {activeTab === "skills" && <SkillsTab character={character} onChange={update} />}
        {activeTab === "feats" && <FeatsTab character={character} onChange={update} />}
        {activeTab === "inventory" && <InventoryTab character={character} onChange={update} />}
        {activeTab === "spells" && <SpellsTab character={character} onChange={update} />}
        {activeTab === "companions" && <CompanionsTab character={character} onChange={update} />}
        {activeTab === "notes" && <NotesTab character={character} onChange={update} />}
      </div>
    </div>
  );
}

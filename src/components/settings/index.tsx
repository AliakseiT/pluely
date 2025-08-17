import { useState, useEffect } from "react";
import { SettingsIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  ScrollArea,
} from "@/components";
import { providers } from "@/config";
import { ProviderSelection } from "./ProviderSelection";
import { ApiKeyInput } from "./ApiKeyInput";
import { ModelSelection } from "./ModelSelection";
import { Disclaimer } from "./Disclaimer";
import { SystemPrompt } from "./SystemPrompt";
import {
  loadSettingsFromStorage,
  saveSettingsToStorage,
  fetchModels,
} from "@/lib";
import { SettingsState } from "@/types";

export const Settings = () => {
  const [settings, setSettings] = useState<SettingsState>(
    loadSettingsFromStorage
  );

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  const updateSettings = (updates: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleApiKeySubmit = async () => {
    if (!settings.apiKey.trim()) return;

    const provider = providers.find((p) => p.id === settings.selectedProvider);
    if (!provider) return;

    // Mark API key as submitted first
    updateSettings({
      isApiKeySubmitted: true,
      isLoadingModels: false,
      modelsFetchError: null,
      availableModels: [],
    });

    // Try to fetch models if provider supports it
    if (provider.models) {
      updateSettings({ isLoadingModels: true });

      try {
        const models = await fetchModels(provider, settings.apiKey.trim());
        updateSettings({
          isLoadingModels: false,
          availableModels: models,
          modelsFetchError: null,
          // Clear selected model if it's not in the fetched models
          selectedModel: models.includes(settings.selectedModel)
            ? settings.selectedModel
            : "",
        });
      } catch (error) {
        console.error("Failed to fetch models:", error);
        updateSettings({
          isLoadingModels: false,
          modelsFetchError:
            error instanceof Error ? error.message : "Failed to fetch models",
          availableModels: [],
        });
      }
    }
  };

  const handleApiKeyDelete = () => {
    updateSettings({
      apiKey: "",
      isApiKeySubmitted: false,
      selectedModel: "",
      customModel: "",
      availableModels: [],
      isLoadingModels: false,
      modelsFetchError: null,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApiKeySubmit();
    }
  };

  const currentProvider = providers.find(
    (p) => p.id === settings.selectedProvider
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" aria-label="Open Settings">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      {/* Settings Panel */}
      <PopoverContent
        align="end"
        side="bottom"
        className="w-screen p-0 pr-1 border shadow-lg overflow-hidden"
        sideOffset={8}
      >
        <ScrollArea className="h-[calc(100vh-6.5rem)]">
          <div className="p-6 space-y-4">
            {/* Configuration Header */}
            <div className="border-b pb-2">
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AI Configuration
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Configure your AI provider, authentication, and model
                preferences for the best experience.
              </p>
            </div>

            {/* AI Provider Selection */}
            <ProviderSelection
              value={settings.selectedProvider}
              onChange={(value) =>
                updateSettings({
                  selectedProvider: value,
                  apiKey: "",
                  isApiKeySubmitted: false,
                  selectedModel: "",
                  customModel: "",
                  availableModels: [],
                  isLoadingModels: false,
                  modelsFetchError: null,
                })
              }
            />

            {/* API Key Configuration */}
            <ApiKeyInput
              providerName={currentProvider?.name || ""}
              value={settings.apiKey}
              onChange={(value) => updateSettings({ apiKey: value })}
              onSubmit={handleApiKeySubmit}
              onDelete={handleApiKeyDelete}
              onKeyPress={handleKeyPress}
              isSubmitted={settings.isApiKeySubmitted}
            />

            {/* Model Selection */}
            <ModelSelection
              provider={settings.selectedProvider}
              selectedModel={settings.selectedModel}
              customModel={settings.customModel}
              onModelChange={(value) =>
                updateSettings({
                  selectedModel: value.replace("models/", ""),
                })
              }
              onCustomModelChange={(value) =>
                updateSettings({ customModel: value })
              }
              disabled={!settings.isApiKeySubmitted}
              availableModels={settings.availableModels}
              isLoadingModels={settings.isLoadingModels}
              modelsFetchError={settings.modelsFetchError}
            />

            {/* System Prompt */}
            <SystemPrompt
              value={settings.systemPrompt}
              onChange={(value) => updateSettings({ systemPrompt: value })}
            />
          </div>
        </ScrollArea>

        <div className="border-t bg-muted/30 backdrop-blur-sm">
          <Disclaimer />
        </div>
      </PopoverContent>
    </Popover>
  );
};

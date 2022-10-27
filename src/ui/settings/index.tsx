import { React, i18n } from "@metro/common";
import { findByDisplayName } from "@metro/filters";
import { after } from "@lib/patcher";
import findInReactTree from "@utils/findInReactTree";
import SettingsSection from "@ui/settings/components/SettingsSection";
import General from "@ui/settings/pages/General";
import AssetBrowser from "@ui/settings/pages/AssetBrowser";

const screensModule = findByDisplayName("getScreens", false);
const settingsModule = findByDisplayName("UserSettingsOverviewWrapper", false);

export default function initSettings() {
    after("default", screensModule, (args, ret) => {
        return {
            ...ret,
            VendettaSettings: {
                title: "Vendetta",
                render: General,
            },
            VendettaAssetBrowser: {
                title: "Asset Browser",
                render: AssetBrowser,
            },
        }
    });

    after("default", settingsModule, (args, _ret) => {
        const toPatch = findInReactTree(_ret.props.children, i => i.type && i.type.name === "UserSettingsOverview");

        // Upload logs button gone
        after("renderSupportAndAcknowledgements", toPatch.type.prototype, (args, { props: { children } }) => {
            const index = children.findIndex((c: any) => c?.type?.name === "UploadLogsButton");
            if (index !== -1) children.splice(index, 1);
        });

        after("render", toPatch.type.prototype, (args, { props: { children } }) => {
            const titles = [i18n.Messages["BILLING_SETTINGS"], i18n.Messages["PREMIUM_SETTINGS"]];
            const index = children.findIndex((c: any) => titles.includes(c.props.title));
            children.splice(index === -1 ? 4 : index, 0, <SettingsSection navigation={toPatch.props.navigation} />);
        });
    }, true);
}
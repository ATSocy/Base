import isArray from "lodash/isArray";
import sortBy from "lodash/sortBy";
import { observable } from "mobx";
import Logger from "./Logger";
import isCloudHosted from "./isCloudHosted";

/**
 * The different types of client plugins that can be registered.
 */
export enum Hook {
  Settings = "settings",
  Icon = "icon",
}

/**
 * A map of plugin types to their values, each plugin type has a different shape of value.
 */
type PluginValueMap = {
  [Hook.Settings]: {
    group: string;
    icon: React.ElementType;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
  };
  [Hook.Icon]: React.ElementType;
};

export type Plugin<T extends Hook> = {
  /** A unique identifier for the plugin */
  id: string;
  /** Plugin type */
  type: T;
  /** The plugin's display name */
  name: string;
  /** A brief description of the plugin */
  description?: string;
  /** The plugin content */
  value: PluginValueMap[T];
  /** Priority will affect order in menus and execution. Lower is earlier. */
  priority?: number;
  /** The deployments this plugin is enabled for (default: all) */
  deployments?: string[];
  /** The roles this plugin is enabled for. (default: admin) */
  roles?: string[];
};

/**
 * Client plugin manager.
 */
export class PluginManager {
  /**
   * Add plugins
   * @param plugins
   */
  public static add(plugins: Array<Plugin<Hook>> | Plugin<Hook>) {
    if (isArray(plugins)) {
      return plugins.forEach((plugin) => this.register(plugin));
    }

    this.register(plugins);
  }

  private static register<T extends Hook>(plugin: Plugin<T>) {
    const enabledInDeployment =
      !plugin?.deployments ||
      plugin.deployments.length === 0 ||
      (plugin.deployments.includes("cloud") && isCloudHosted) ||
      (plugin.deployments.includes("community") && !isCloudHosted) ||
      (plugin.deployments.includes("enterprise") && !isCloudHosted);
    if (!enabledInDeployment) {
      return;
    }

    if (!this.plugins.has(plugin.type)) {
      this.plugins.set(plugin.type, []);
    }

    this.plugins
      .get(plugin.type)!
      .push({ ...plugin, priority: plugin.priority ?? 0 });

    Logger.debug(
      "plugins",
      `Plugin(type=${plugin.type}) registered ${plugin.name} ${
        plugin.description ? `(${plugin.description})` : ""
      }`
    );
  }

  /**
   * Returns all the plugins of a given type in order of priority.
   *
   * @param type The type of plugin to filter by
   * @returns A list of plugins
   */
  public static getHooks<T extends Hook>(type: T) {
    return sortBy(this.plugins.get(type) || [], "priority") as Plugin<T>[];
  }

  /**
   * Load plugin client components, must be in `/<plugin>/client/index.ts`
   */
  public static async loadPlugins() {
    if (this.loaded) {
      return;
    }

    const r = import.meta.glob("../../plugins/*/client/index.{ts,js,tsx,jsx}");
    await Promise.all(Object.keys(r).map((key: string) => r[key]()));

    this.loaded = true;
  }

  private static plugins = observable.map<Hook, Plugin<Hook>[]>();

  private static loaded = false;
}

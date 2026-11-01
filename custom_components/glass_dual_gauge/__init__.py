"""Glass Dual Gauge: two sensors on one frosted-glass gauge card.

The integration serves the dashboard card and keeps it registered as a
dashboard resource, so there's nothing to add by hand.
"""

from __future__ import annotations

from pathlib import Path

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv

from .const import CARD_FILE, CARD_URL, DATA_FRONTEND, DOMAIN
from .resources import async_ensure_resource, async_remove_resource, resource_url

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await _async_register_frontend(hass)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    # The card file stays served until Home Assistant restarts; nothing else to unload.
    return True


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Deleting the integration also removes the card from dashboard resources."""
    await async_remove_resource(hass)
    hass.data.pop(DATA_FRONTEND, None)


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Serve the card and make sure dashboards load the current version of it.

    The card is added to Settings > Dashboards > Resources (and kept on the
    current version after updates). If that isn't possible, for example with
    dashboards in YAML mode, it is injected into every page instead.
    """
    if hass.data.get(DATA_FRONTEND):
        return
    card = Path(__file__).parent / "frontend" / CARD_FILE
    await hass.http.async_register_static_paths([StaticPathConfig(CARD_URL, str(card), False)])
    if not await async_ensure_resource(hass):
        add_extra_js_url(hass, resource_url())
    hass.data[DATA_FRONTEND] = True

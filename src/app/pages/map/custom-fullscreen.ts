
import { Control, ControlPosition, DomUtil, Util } from "leaflet";
import { environment } from "src/environments/environment";

const FullScreenMap = Control.extend({

    initialize: function (options: {position: ControlPosition}) {
        Util.setOptions(this, options);
    },
    options: {
      position: "topleft",
    },
    onAdd: () => {
        const container = DomUtil.create(
            "input",
            "leaflet-control-zoom leaflet-bar leaflet-control"
        );
        container.type = "button";
        container.title = "Ver en pantalla completa";
        container.style.backgroundImage = `url(${environment.urlIcon}/assets/images/fullscreen.svg)`;
        container.style.backgroundSize = "15px 15px";
        container.style.backgroundRepeat = "no-repeat";
        container.style.backgroundPosition = "50% 50%";
        container.style.width = "32px";
        container.style.height = "32px";
        container.style.padding = "12px";
        container.style.lineHeight = "30px";
        container.style.fontSize = "22px";
        container.style.fontWeight = "bold";
        container.style.cursor = "pointer";
        container.style.backgroundColor = "white";
        container.style.marginLeft = "11px"
        container.style.borderRadius = "3px"


        container.onclick = () => {
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullScreen
            if (!document.fullscreenElement) {
                document.getElementById("map")!.requestFullscreen();
                container.title = "Salir de pantalla completa";
            } else {
            document.exitFullscreen();
            container.title = "Ver en pantalla completa";
            }
        };


        return container;
    },
  });

  export const fullScreenMap = (options?: {position?: ControlPosition}) => new FullScreenMap(options);
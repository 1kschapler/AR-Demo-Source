import * as THREE from 'three';

let scene;

class HackathonButton {

	static createButton( renderer, buttonLabel, posX, posY, surfaceName, scene, sessionInit = {} ) {

        scene = scene;

		const button = document.createElement( 'button' );

		function showStartAR( /*device*/) {

			if ( sessionInit.domOverlay === undefined ) {

				var overlay = document.createElement( 'div' );
				overlay.style.display = 'none';
				document.body.appendChild( overlay );

				var svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
				svg.setAttribute( 'width', 38 );
				svg.setAttribute( 'height', 38 );
				svg.style.position = 'absolute';
				// svg.style.right = '20px';
                // svg.style.top = '20px';
                svg.style.right = posX+'px';
				svg.style.top = posY+'px';
				// svg.addEventListener( 'click', function () {

				// 	currentSession.end();

				// } );
				overlay.appendChild( svg );

				var path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
				path.setAttribute( 'd', 'M 12,12 L 28,28 M 28,12 12,28' );
				path.setAttribute( 'stroke', '#fff' );
				path.setAttribute( 'stroke-width', 2 );
				svg.appendChild( path );

				if ( sessionInit.optionalFeatures === undefined ) {

					sessionInit.optionalFeatures = [];

				}

				sessionInit.optionalFeatures.push( 'dom-overlay' );
				sessionInit.domOverlay = { root: overlay };

			}

			//

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				renderer.xr.setReferenceSpaceType( 'local' );

				await renderer.xr.setSession( session );

				button.textContent = 'STOP AR';
				sessionInit.domOverlay.root.style.display = 'none';

				currentSession = session;

			}

			function onSessionEnded( /*event*/ ) {
				currentSession.removeEventListener( 'end', onSessionEnded );

				button.textContent = 'START AR';
				sessionInit.domOverlay.root.style.display = '';

				currentSession = null;

			}

			//

			button.style.display = '';

			//button.style.cursor = 'pointer';
            button.style.left = 'calc(50% - '+posY+'px)';
            //button.style.left = 'calc(50% - 50px)';
            //button.style.top = 'calc(50% - '+posY+'px)';


            // button.style.left = posY+'px';
            // button.style.top = posX +'px';
            // button.style.bottom = posX-100+'px';
			button.style.width = '60px';

			button.textContent = buttonLabel;

			button.onmouseenter = function () {

				button.style.opacity = '1.0';

			};

			button.onmouseleave = function () {

				button.style.opacity = '0.5';

			};

            function setSurfaceVisibleToggle(surfaceName) {
                scene.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        if (child.name === surfaceName) {
                            if (child.visible === true) {
                                child.visible = false;
                            } else {
                                child.visible = true;
                            }
                        }
                    }
                });
            }

			button.onclick = function () {
                //console.log(scene)
                console.log("hiding "+surfaceName);

                setSurfaceVisibleToggle(surfaceName);

                //clickFunction(scene, surfaceName);
				// if ( currentSession === null ) {

                //     //navigator.xr.requestSession( 'immersive-ar', sessionInit ).then( onSessionStarted );
                //     console.log("CHECK");
                //     clickFunction();

				// } else {

				// 	currentSession.end();

				// }
			};

		}

		function disableButton() {

			button.style.display = '';

			button.style.cursor = 'auto';
            button.style.left = 'calc(50% - '+posX+'px)';
			button.style.width = '150px';

			button.onmouseenter = null;
			button.onmouseleave = null;

			button.onclick = null;

		}

		function showARNotSupported() {

			disableButton();

			button.textContent = 'AR NOT SUPPORTED';

		}

		function stylizeElement( element ) {
			element.style.position = 'absolute';
			element.style.bottom = '20px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			//element.style.background = 'rgba(0,0,0,0.1)';
			element.style.color = '#0000FF';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			//element.style.opacity = '1';
			element.style.outline = 'none';
			element.style.zIndex = '999';
		}

		if ( 'xr' in navigator ) {

			button.id = 'ARButton';
			button.style.display = 'none';

			stylizeElement( button );

			navigator.xr.isSessionSupported( 'immersive-ar' ).then( function ( supported ) {

				supported ? showStartAR() : showARNotSupported();

			} ).catch( showARNotSupported );

			return button;

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}

	}

}

export { HackathonButton };
<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import LinkSnippet from './LinkSnippet.vue'

let buttonGenerator = gApp.buttonGenerator

let feedLink = computed(() => {
  return Feed.makeShareLink(buttonGenerator.name, buttonGenerator.type, buttonGenerator.url);
})

let bigButtonHtml = computed(() => {
	let html = `
<svg xmlns="http://www.w3.org/2000/svg" 
    xmlns:xlink="http://www.w3.org/1999/xlink"
    xmlns:krita="http://krita.org/namespaces/svg/krita"
    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    width="150pt"
    height="84pt"
    viewBox="0 0 192 84">
<defs/>
<a href="${feedLink.value}" target="_blank">
<g id="group0" transform="matrix(1.89843397443211 0 0 1.89843397443211 18.4264685426437 18.3901104209246)" fill="none">
  <g id="group1" fill="none">
   <circle id="shape0" transform="translate(6.849, 6.23999999999998)" r="0.827" cx="0.827" cy="0.827" fill="#000000" stroke-opacity="0" stroke="#000000" stroke-width="0" stroke-linecap="square" stroke-linejoin="bevel"/>
   <path id="shape1" transform="translate(-0.00040403933140102, 3.58710792757896)" fill="#000000" stroke-opacity="0" stroke="#000000" stroke-width="0" stroke-linecap="square" stroke-linejoin="bevel" d="M21.8414 0.656892C17.8414 -0.355108 14.6434 -0.101108 10.4104 2.42789C10.3134 1.50389 7.8804 -1.26911 4.9134 0.677892C1.7514 0.286892 1.7514 3.54689 1.7514 3.54689C1.7514 3.54689 0.023404 6.58589 0.000404039 7.73089C-0.015596 8.49689 0.446404 8.70389 0.888404 8.83589C3.1734 7.53489 5.2474 7.84389 6.9324 8.09589C7.8104 8.22689 8.5714 8.33789 9.1404 8.17789C9.3374 8.12089 9.5444 8.23789 9.6004 8.43589C9.6564 8.63289 9.5404 8.83989 9.3434 8.89689C8.6194 9.09989 7.7864 8.97689 6.8224 8.83289C5.3144 8.60789 3.4724 8.34689 1.4944 9.36789C3.3724 12.6399 8.5764 13.7499 12.3564 11.1369C13.1814 11.1889 14.2634 11.3119 15.4304 11.4079C15.6454 11.4249 15.4344 12.1049 15.2254 12.7829C15.1524 13.0189 12.3624 13.6029 12.3074 13.8099C12.2064 14.1989 14.8444 13.8819 15.0324 14.1509C15.2194 14.4219 14.6924 15.6599 14.9354 16.2449C15.0974 16.6339 16.4154 16.2339 16.7844 15.3189C16.9704 14.8629 16.1914 13.9599 16.3644 13.5969C16.8844 12.5139 17.3384 11.5239 17.4194 11.5259C17.9604 11.5429 18.4994 11.5439 19.0234 11.5189C20.1154 11.4689 21.1694 11.3669 22.1454 11.2819C22.2694 11.2709 22.4774 11.7069 22.6974 12.2149C22.7974 12.4469 20.8694 12.7989 20.9684 13.0269C21.1714 13.4929 22.8654 13.1789 23.4974 13.7609C24.1304 14.3449 24.1504 15.9169 24.6164 16.0969C24.8734 16.1959 25.9504 15.4229 25.7354 14.4429C25.4214 13.0129 23.6994 11.1689 23.7894 11.1649C24.9844 11.1099 25.9774 11.1669 26.6594 11.5199C29.1894 12.8289 27.3414 22.5669 21.0164 23.0549C17.5714 23.3199 16.4204 20.5639 16.8484 19.0269C17.2714 17.5079 19.1674 16.6819 20.4824 16.8789C21.7944 17.0709 22.0384 18.2889 21.4554 19.1139C21.3784 19.2229 21.2894 19.3239 21.1944 19.4179C20.9684 19.1889 20.6564 19.0469 20.3104 19.0469C19.6234 19.0469 19.0684 19.6039 19.0684 20.2889C19.0684 20.9759 19.6244 21.5299 20.3104 21.5299C20.9304 21.5299 21.4404 21.0749 21.5334 20.4779C21.8674 20.3949 22.1974 20.2329 22.4774 19.9419C23.5954 18.7739 23.3524 16.6819 21.2334 15.9639C18.8624 15.1619 15.5394 16.6519 15.4414 19.1819C15.3444 21.7109 17.6654 24.6779 21.6624 24.4499C27.5974 24.1079 31.8664 17.9459 31.6274 12.2579C31.4214 7.43889 28.8474 2.42789 21.8414 0.656892ZM6.9224 6.12589C5.5924 6.12589 4.5144 5.04789 4.5144 3.71789C4.5144 2.38789 5.5924 1.30989 6.9224 1.30989C8.2514 1.30989 9.3294 2.38789 9.3294 3.71789C9.3304 5.04789 8.2524 6.12589 6.9224 6.12589Z" sodipodi:nodetypes="cccccccccccccccccccccccccccccccccccccccccccccccccc"/>
  </g>
 </g><text id="shape01" krita:useRichText="true" krita:textVersion="2" transform="matrix(0.999999998380146 0 0 0.999999998380146 81.7060977459853 49.8862519631626)" fill="#000000" stroke-opacity="0" stroke="#000000" stroke-width="0" stroke-linecap="square" stroke-linejoin="bevel" font-family="Inter" font-size="24" font-size-adjust="0.449946" font-stretch="normal" font-weight="900" letter-spacing="-1" word-spacing="0"><tspan x="0">Jungle</tspan><tspan x="0" dy="20.321875">Reader</tspan></text><text id="shape2" krita:useRichText="true" krita:textVersion="2" transform="translate(83.3999954378608, 29.5599987554552)" fill="#000000" stroke-opacity="0" stroke="#000000" stroke-width="0" stroke-linecap="square" stroke-linejoin="bevel" font-family="Inter" font-size="8" font-size-adjust="0.449946" font-stretch="normal" font-weight="700" letter-spacing="0" word-spacing="0"><tspan x="0">Follow on:</tspan></text><rect id="shape3" transform="translate(11.8799991657182, 16.08)" fill="none" stroke="#000000" stroke-width="1.44" stroke-linecap="square" stroke-linejoin="bevel" width="161.640000834282" height="64.08" rx="9.57866671610559" ry="9.6"/>
</a>
</svg>`;
  return html;
})

let smallButtonHtml = computed(() => {
  let width = '48px';
  let height = '48px';
	let html = `	
<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 31.637 31.637" xml:space="preserve">
  <a href="${feedLink.value}" target="_blank">
    <g>
      <g>
        <circle cx="7.676" cy="7.067" r="0.827"/>
        <path d="M21.841,4.244c-4-1.012-7.198-0.758-11.431,1.771c-0.097-0.924-2.53-3.697-5.497-1.75    C1.751,3.874,1.751,7.134,1.751,7.134S0.023,10.173,0,11.318c-0.016,0.766,0.446,0.973,0.888,1.105    c2.285-1.301,4.359-0.992,6.044-0.74c0.878,0.131,1.639,0.242,2.208,0.082c0.197-0.057,0.404,0.06,0.46,0.258    c0.056,0.197-0.06,0.404-0.257,0.461c-0.724,0.203-1.557,0.08-2.521-0.064c-1.508-0.225-3.35-0.486-5.328,0.535    c1.878,3.272,7.082,4.382,10.862,1.769c0.825,0.052,1.907,0.175,3.074,0.271c0.215,0.017,0.004,0.697-0.205,1.375    c-0.073,0.236-2.863,0.82-2.918,1.027c-0.101,0.389,2.537,0.072,2.725,0.341c0.187,0.271-0.34,1.509-0.097,2.094    c0.162,0.389,1.48-0.011,1.849-0.926c0.186-0.456-0.593-1.359-0.42-1.722c0.52-1.083,0.974-2.073,1.055-2.071    c0.541,0.017,1.08,0.018,1.604-0.007c1.092-0.05,2.146-0.152,3.122-0.237c0.124-0.011,0.332,0.425,0.552,0.933    c0.1,0.232-1.828,0.584-1.729,0.812c0.203,0.466,1.897,0.152,2.529,0.734c0.633,0.584,0.653,2.156,1.119,2.336    c0.257,0.099,1.334-0.674,1.119-1.654c-0.314-1.43-2.036-3.274-1.946-3.278c1.195-0.055,2.188,0.002,2.87,0.355    c2.53,1.309,0.682,11.047-5.643,11.535c-3.445,0.265-4.596-2.491-4.168-4.028c0.423-1.519,2.319-2.345,3.634-2.148    c1.312,0.192,1.556,1.41,0.973,2.235c-0.077,0.109-0.166,0.21-0.261,0.304c-0.226-0.229-0.538-0.371-0.884-0.371    c-0.687,0-1.242,0.557-1.242,1.242c0,0.687,0.556,1.241,1.242,1.241c0.62,0,1.13-0.455,1.223-1.052    c0.334-0.083,0.664-0.245,0.944-0.536c1.118-1.168,0.875-3.26-1.244-3.978c-2.371-0.802-5.694,0.688-5.792,3.218    c-0.097,2.529,2.224,5.496,6.221,5.268c5.935-0.342,10.204-6.504,9.965-12.192C31.421,11.026,28.847,6.015,21.841,4.244z     M6.922,9.713c-1.33,0-2.408-1.078-2.408-2.408c0-1.33,1.078-2.408,2.408-2.408c1.329,0,2.407,1.078,2.407,2.408    C9.33,8.635,8.252,9.713,6.922,9.713z"/>
      </g>
    </g>
  </a>
</svg>`;
	return html
})

</script>

<template>
<div class="ButtonGenerator">
  <div class="Fields">
    <h3>Enter:</h3>
    <div class="FormFieldName">Feed Name</div>
    <input v-model="buttonGenerator.name" placeholder="My Feed" class="Block WideInput BasicTextInput" autofocus>
    <div class="FormFieldName">Feed Type</div>
    <input v-model="buttonGenerator.type" placeholder="RSS" class="Block WideInput BasicTextInput" autofocus>
    <div class="FormFieldName">Feed URL</div>
    <input v-model="buttonGenerator.url" placeholder="https://www.mysite.com" class="Block WideInput BasicTextInput" autofocus>
  </div>
  <div class="Output">
    <h3>Output:</h3>
    <div class="FormFieldName">Link</div>
    <LinkSnippet :theLink="feedLink" />
    <div class="FormFieldName">HTML Big Button Link (as shown)</div>
    <div v-html="bigButtonHtml"></div>
		<LinkSnippet :theLink="bigButtonHtml" />
    <div class="FormFieldName">HTML Small Button Link (as shown)</div>
		<div v-html="smallButtonHtml"></div>
		<LinkSnippet :theLink="smallButtonHtml" />
  </div>
</div>
</template>

<style scoped>
.Fields {
  /*
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  */
}

.FormFieldName {
  font-size: 1rem;
  line-height: 1.5;
  margin-top: 5px;
}

.Output {
  margin-top: 16px;
}

.Output .FormFieldName {
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 16px;
}

</style>

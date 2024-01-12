import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from "langchain/prompts";
import path from "path";
import fs from "fs";

const model = new ChatOpenAI({
  temperature: 0.5,
  maxTokens: 1000,
  modelName: "gpt-3.5-turbo",
});

const systemJsonPrompt = `
As a UX/UI Designer specializing in content strategy for landing pages, you are tasked with creating compelling, clear, and brand-aligned text that engages and informs visitors. Your deep understanding of user behavior and content hierarchy will guide the development of content that resonates with the audience and encourages action.

Your responsibilities include:
- Designing the visual and textual content layout for the landing page.
- Ensuring the content is intuitive, accessible, and aesthetically pleasing.
- Creating a cohesive look and feel that resonates with the brand's values.
- Balancing the amount of text and visuals to optimize user engagement.
- Considering the user journey and how the content guides them through the page.

Please proceed with generating the content for the following sections, keeping in mind the best UX/UI practices:

1. Heading Section: Develop a captivating headline and tagline that will serve as the focal point of the landing page.
2. About Section: Compose a brief yet impactful paragraph that introduces the company and its core mission.
3. Footer Section: Organize the footer content to include essential information such as contact details, navigation links, and social media connections.

Remember to:
- Use language that is clear, concise, and persuasive.
- Apply principles of typography, color theory, and composition to enhance readability and visual appeal.
- Prioritize mobile responsiveness and accessibility in your design choices.
- Incorporate SEO strategies to improve the landing page's visibility.

As you generate the content, visualize the user experience and aim to create a seamless and memorable interaction with the brand.
`;

// const selectTemplate = `
// Title: {TITLE}
// Description: {DESCRIPTION}

// Given two potential templates for a landing page, evaluate which template best aligns with the provided page TITLE and DESCRIPTION.

// Sections to include:
// 1. Heading (Headline and Tagline)
// 2. About Us
// 3. Footer (Contact Information, Quick Links, Social Media)

// TEMPLATE_1: {TEMPLATE1}
// TEMPLATE_2: {TEMPLATE2}

// Assess the strengths and suitability of each template in relation to the TITLE and DESCRIPTION provided. Take into account factors such as the field of the company and the visual impact.

// After careful consideration, select the template that you believe will best serve the landing page's goals and resonate with the visitors.

// JSON SCHEMA: {{ "selectedTemplate": "String" }}

// Output the JSON object with your selected template choice.
// json should be wraped in a <json> tag.

// Example:
// <json>
//   {{
//     "selectedTemplate": "TEMPLATE_X"
//   }}
// </json>
// `;

const headingTemplate = `
Generate content for the heading section of a landing page. The content should be a JSON object containing arrays for headlines and taglines, adhering to the provided JSON schema.

Title: {TITLE}
Description: {DESCRIPTION}

JSON SCHEMA: {{ "headline": String, "tagline": String }}

Guidelines:
- The headline should be a short, captivating phrase that grabs the visitor's attention. 30 characters max.
- The tagline should be a brief description of the company's mission. 250 characters max.

Output the JSON object with the generated content for the heading section.
json should be wraped in a <json> tag.
`;

const aboutTemplate = `
Generate a concise and informative paragraph for the about section of the landing page. The content should not exceed 500 characters and should encapsulate the essence of the company.

Title: {TITLE}
Description: {DESCRIPTION}
HEADING: {HEADING}

Guidelines:
- The paragraph should be written in a clear, concise, and engaging manner.
- The paragraph should be written in the third person.
- The paragraph should be written in the present tense.
- 500 characters max.
- Write the whole paragraph in one go, don't inclide varibale like {{Title}}. 

JSON SCHEMA: {{ about: String }}

Output the JSON object with the generated content for the about section.
json should be wraped in a <json> tag.

Example:
<json>
{{
  "about": "Lorem ipsum dolor sit amet, consectetur ..."
}}
</json>

`;

const footerTemplate = `
Generate content for the footer section of a landing page. The content should be a JSON object containing arrays for headlines and taglines, adhering to the provided JSON schema.

Title: {TITLE}
COMPABNY_TITLE: {TITLE}
Description: {DESCRIPTION}
HEADING: {HEADING}
ABOUT: {ABOUT}

TEMPLATE:
<code>
  <section class="info_section">
  <div class="container">
    <div class="row">
      <div class="col-md-3">
        <div class="info_contact">
          <h5>COMPABNY_TITLE</h5>
          <div>
            <div class="img-box">
              <img src="images/location-white.png" width="18px" alt="" />
            </div>
            <p>ADDRESS_IF_ANY</p>
          </div>
          <div>
            <div class="img-box">
              <img src="images/telephone-white.png" width="12px" alt="" />
            </div>
            <p>PHONE_IF_ANY</p>
          </div>
          <div>
            <div class="img-box">
              <img src="images/envelope-white.png" width="18px" alt="" />
            </div>
            <p>EMAIL_IF_ANY</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="info_info">
          <h5>Informations</h5>
          <p>COMPANY_DESCRIPTION</p>
        </div>
      </div>
      <div class="col-md-3">
      </div>
      <div class="col-md-3">
        <div class="info_form">
          <div class="social_box">
            <!-- ADD SOCIAL MEDIA LINKS HERE IF ANY -->
            <a href="">
              <img src="images/fb.png" alt="" />
            </a>
            <a href="">
              <img src="images/twitter.png" alt="" />
            </a>
            <a href="">
              <img src="images/linkedin.png" alt="" />
            </a>
            <a href="">
              <img src="images/youtube.png" alt="" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  </section>
</code>

Guidelines:
- The footer should be written in a clear, concise, and engaging manner.
- fill in the relevant information in the template.
- Don't inclide varibale like {{Title}}.
- Update the template with the generated content. bese on COMPANY_TITLE, DESCRIPTION, HEADING, ABOUT.
- The content should be relevant to the company and its mission.
- Provide a real address, phone number, and email address if available.
- If you only have the city and country, put it in the address.
- Extract all the information from the DESCRIPTION.

Output the HTML code for the footer section.
json should be wraped in a <code> tag.

Example:
<code>
  html code here
</code>
`;

export async function POST(request: Request) {
  const data = await request.json();
  const { title, description } = data;

  // Select template Prompt
  // Two tremplate with detailled description as input for the prompt
  // Use the title and description as input for the prompt.

  // const selectChatTemplate = ChatPromptTemplate.fromMessages([
  //   systemJsonPrompt,
  //   HumanMessagePromptTemplate.fromTemplate(selectTemplate),
  // ]);

  // const messages = await selectChatTemplate.formatMessages({
  //   TITLE: title,
  //   DESCRIPTION: description,
  //   TEMPLATE1:
  //     "tech startup, use this template for a Tech and IT startups landing page like AI, development of Web and Mobile applications, SaaS, etc.",
  //   TEMPLATE2:
  //     "industrial, use this template for a industrial and manufacturing landing page, like factory, industry, construction, etc.",
  // });

  // const selectReplaty = await model.invoke(messages);
  // console.log("selectReplaty", selectReplaty.content);
  // console.log(selectReplaty.content.concat().toString());

  // const selectJson = extractAndParseJson(
  //   selectReplaty.content.concat().toString()
  // );
  // console.log(selectJson);
  // console.log(selectJson.selectedTemplate);

  // Generate content for the landing page base on the selected template
  // Use the title and description as input for the prompt
  // 1. Generate content for the heading section of the landing page, the generated
  // content should be json object containing paragraphs and headings.
  // JSON SCHEMA: { headline: [], tagline: [] }

  const headingChatTemplate = ChatPromptTemplate.fromMessages([
    systemJsonPrompt,
    HumanMessagePromptTemplate.fromTemplate(headingTemplate),
  ]);

  const headingMessages = await headingChatTemplate.formatMessages({
    TITLE: title,
    DESCRIPTION: description,
  });

  const headingReply = await model.invoke(headingMessages);

  const headingJson = extractAndParseJson(
    headingReply.content.concat().toString()
  );
  console.log("headline", headingJson.headline);
  console.log("tagline", headingJson.tagline);

  // // 2. Generate content for the about section of the landing page, the generated
  // // content should be a paragraph of 500 charachter max.
  // // JSON SCHEMA: { about: String }

  const aboutChatTemplate = ChatPromptTemplate.fromMessages([
    systemJsonPrompt,
    HumanMessagePromptTemplate.fromTemplate(aboutTemplate),
  ]);

  const aboutMessages = await aboutChatTemplate.formatMessages({
    TITLE: title,
    DESCRIPTION: description,
    HEADING: headingJson.headline,
  });

  const aboutReply = await model.invoke(aboutMessages);

  const aboutJson = extractAndParseJson(aboutReply.content.toString());

  console.log("about", aboutJson.about);

  // // 3. Generate content for the footer section of the landing page, the generated
  // // content should be json object containing paragraphs and headings.

  const footerChatTemplate = ChatPromptTemplate.fromMessages([
    systemJsonPrompt,
    HumanMessagePromptTemplate.fromTemplate(footerTemplate),
  ]);

  const footerMessages = await footerChatTemplate.formatMessages({
    TITLE: title,
    DESCRIPTION: description,
    HEADING: headingJson.headline,
    ABOUT: aboutJson.about,
  });

  const footerReply = await model.invoke(footerMessages);
  console.log(footerReply.content);

  const footerCode = extractCode(footerReply.content.toString());

  // 4. Update the landing page tempalte with the generated content and save it in a file.

  // HTML FILE PATH: C:\Users\Ali\Documents\AICrafters\Template-tech-main\index.html
  // load the file

  if (!process.env.TEMPLATE_PATH) {
    return Response.json("Template path not set", { status: 500 });
  }

  const filePath = path.join(process.env.TEMPLATE_PATH);
  let fileContent = fs.readFileSync(filePath, "utf8");

  fileContent = fileContent.replace(/{COMPANY}/g, title);
  fileContent = fileContent.replace(/{HEADLINE}/g, headingJson.headline);
  fileContent = fileContent.replace(/{TAGLINE}/g, headingJson.tagline);
  fileContent = fileContent.replace(/{ABOUT}/g, aboutJson.about);
  fileContent = fileContent.replace(/{FOOTER}/g, footerCode);

  // save the file
  fs.writeFileSync(filePath, fileContent);

  return Response.json("reply.content", { status: 200 });
}

function extractAndParseJson(input: string): any {
  // Define a regular expression to match the <json> tag and capture its contents
  const jsonTagRegex = /<json>(.*?)<\/json>/s;

  // Attempt to match the input string against the regex
  const match = input.match(jsonTagRegex);

  // If there's a match and it has captured contents
  if (match && match[1]) {
    try {
      // Parse the captured contents as JSON
      const json = JSON.parse(match[1]);
      return json;
    } catch (error) {
      // Handle JSON parsing errors
      console.error("Failed to parse JSON:", error);
      return null;
    }
  } else {
    // If no <json> tag is found, or it has no contents, return null or throw an error
    console.error("No <json> tag found or the tag contains no JSON data.");
    return null;
  }
}

function extractCode(input: string): any {
  // Define a regular expression to match the <code> tag and capture its contents
  const codeTagRegex = /<code>(.*?)<\/code>/s;

  // Attempt to match the input string against the regex
  const match = input.match(codeTagRegex);

  // If there's a match and it has captured contents
  if (match && match[1]) {
    const code = match[1];
    return code;
  } else {
    // If no <code> tag is found, or it has no contents, return null or throw an error
    console.error("No <code> tag found.");
    return null;
  }
}

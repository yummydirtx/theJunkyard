<div id="top">

<!-- HEADER STYLE: COMPACT -->
<img src="./src/assets/websitelogo.png" width="30%" align="left" style="margin-right: 15px">

# theJunkyard
<em></em>

<!-- BADGES -->
<img src="https://img.shields.io/github/license/yummydirtx/theJunkyard?style=flat-square&logo=opensourceinitiative&logoColor=white&color=E92063" alt="license">
<img src="https://img.shields.io/github/last-commit/yummydirtx/theJunkyard?style=flat-square&logo=git&logoColor=white&color=E92063" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/yummydirtx/theJunkyard?style=flat-square&color=E92063" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/yummydirtx/theJunkyard?style=flat-square&color=E92063" alt="repo-language-count">

<em>Built with these tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat-square&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat-square&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Firebase-DD2C00.svg?style=flat-square&logo=Firebase&logoColor=white" alt="Firebase">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat-square&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat-square&logo=React&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat-square&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/GitHub%20Actions-2088FF.svg?style=flat-square&logo=GitHub-Actions&logoColor=white" alt="GitHub%20Actions">
<img src="https://img.shields.io/badge/Vite-646CFF.svg?style=flat-square&logo=Vite&logoColor=white" alt="Vite">

<br clear="left"/>

## 🌈 Table of Contents

<details>
<summary>Table of Contents</summary>

- [🌈 Table of Contents](#-table-of-contents)
- [🔴 Overview](#-overview)
- [🟠 Features](#-features)
- [🟡 Project Structure](#-project-structure)
    - [🟢 Project Index](#-project-index)
- [🔵 Getting Started](#-getting-started)
    - [🟣 Prerequisites](#-prerequisites)
    - [⚫ Installation](#-installation)
    - [⚪ Usage](#-usage)
- [🌟 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

</details>

---

## 🔴 Overview

theJunkyard is a personal web application built with React and Material UI, serving as a dynamic portfolio and playground for various web projects and utilities. It features user authentication via Firebase, theme customization (light/dark mode), and showcases projects like a manual budget tracker, a YouTube thumbnail downloader, and a simple lottery simulation. The project is continuously evolving as a reflection of the developer's growing skills.

---

## 🟠 Features

- **⚛️ React Frontend:** Built with the popular React library for a dynamic user interface.
- **🎨 Material UI:** Utilizes Material UI components for a consistent and modern design.
- **🔐 Firebase Authentication:** Secure user login and registration using Firebase.
- **🌓 Theme Customization:** Supports both light and dark modes, with user preference saved.
- **💰 Manual Budget Tracker:** A tool for users to manually track their expenses across different categories and months, with data stored in Firestore. Includes visualization graphs.
- **🖼️ YouTube Thumbnail Downloader:** Utility to fetch and download thumbnail images from YouTube videos.
- **🎰 Lottery Simulation (calcBasic):** A fun simulation based on a TI-BASIC program to demonstrate probability.
- **📜 Portfolio Showcase:** Displays past and current web projects.
- **🚀 Evolving Playground:** Continuously updated with new experiments and utilities.

---

## 🟡 Project Structure

```sh
└── theJunkyard/
    ├── .github
    │   └── workflows
    ├── LICENSE
    ├── README.md
    ├── firebase.json
    ├── index.html
    ├── package.json
    ├── public
    │   ├── favicon.ico
    │   └── manifest.json
    ├── src
    │   ├── App.jsx
    │   ├── assets
    │   ├── components
    │   ├── contexts
    │   ├── hooks
    │   ├── index.jsx
    │   ├── pages
    │   └── theme.jsx
    ├── tsconfig.json
    ├── vite-env.d.ts
    └── vite.config.ts
```

### 🟢 Project Index

<details open>
	<summary><b><code>THEJUNKYARD/</code></b></summary>
	<!-- __root__ Submodule -->
	<details>
		<summary><b>__root__</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ __root__</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/index.html'>index.html</a></b></td>
					<td style='padding: 8px;'>Provides the basic HTML structure, metadata, and resource links for the 'theJunkyard' web application. It primarily defines the root container where the React application, loaded from index.jsx, will be rendered.</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/LICENSE'>LICENSE</a></b></td>
					<td style='padding: 8px;'>MIT License</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/package.json'>package.json</a></b></td>
					<td style='padding: 8px;'>Package metadata and dependencies for the 'theJunkyard' web application, including scripts for development and production builds.</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/vite-env.d.ts'>vite-env.d.ts</a></b></td>
					<td style='padding: 8px;'>Provides TypeScript type definitions for Vite's client-side environment variables and APIs. This ensures type safety and enables features like IntelliSense for Vite-specific functionalities within the project's TypeScript code.</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/tsconfig.json'>tsconfig.json</a></b></td>
					<td style='padding: 8px;'>Configures the TypeScript compiler options for the project, defining settings such as the target JavaScript version (ESNext), module system (ESNext), JSX handling (react-jsx), and enabling strict type-checking. It ensures consistent code compilation and type safety, integrating with Vite.</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/firebase.json'>firebase.json</a></b></td>
					<td style='padding: 8px;'>Configures Firebase Hosting settings, specifying the public directory, files to ignore, and rewrite rules to direct all requests to `index.html` for single-page application routing.</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/vite.config.ts'>vite.config.ts</a></b></td>
					<td style='padding: 8px;'>Configures the Vite build tool for the project. It includes the React plugin (`@vitejs/plugin-react`) to enable React support with Fast Refresh and specifies build options like the output directory.</code></td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- public Submodule -->
	<details>
		<summary><b>public</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ public</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/public/manifest.json'>manifest.json</a></b></td>
					<td style='padding: 8px;'>Web application manifest file providing metadata used when the web app is installed on a user's device, such as app name, icons, start URL, and display mode.</code></td>
				</tr>
			</table>
		</blockquote>
	</details>
	<!-- src Submodule -->
	<details>
		<summary><b>src</b></summary>
		<blockquote>
			<div class='directory-path' style='padding: 8px 0; color: #666;'>
				<code><b>⦿ src</b></code>
			<table style='width: 100%; border-collapse: collapse;'>
			<thead>
				<tr style='background-color: #f8f9fa;'>
					<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
					<th style='text-align: left; padding: 8px;'>Summary</th>
				</tr>
			</thead>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/App.jsx'>App.jsx</a></b></td>
					<td style='padding: 8px;'>The main application component. Sets up routing using React Router, manages the global theme (light/dark mode), and wraps the application with the authentication context provider.</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/index.jsx'>index.jsx</a></b></td>
					<td style='padding: 8px;'>The entry point of the React application. It renders the root `App` component into the DOM element with the ID 'root'.</code></td>
				</tr>
				<tr style='border-bottom: 1px solid #eee;'>
					<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/theme.jsx'>theme.jsx</a></b></td>
					<td style='padding: 8px;'>Defines a custom Material UI theme for the application, specifying primary, secondary, and error color palettes.</code></td>
				</tr>
			</table>
			<!-- contexts Submodule -->
			<details>
				<summary><b>contexts</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.contexts</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/contexts/AuthContext.jsx'>AuthContext.jsx</a></b></td>
							<td style='padding: 8px;'>Provides authentication state and functions (like login, signup, logout, user data) to the application using React Context and Firebase Authentication. It manages the active user session and Firestore database instance.</code></td>
						</tr>
					</table>
				</blockquote>
			</details>
			<!-- components Submodule -->
			<details>
				<summary><b>components</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ src.components</b></code>
					<table style='width: 100%; border-collapse: collapse;'>
					<thead>
						<tr style='background-color: #f8f9fa;'>
							<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
							<th style='text-align: left; padding: 8px;'>Summary</th>
						</tr>
					</thead>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/Footer.jsx'>Footer.jsx</a></b></td>
							<td style='padding: 8px;'>Renders the application's footer section, including copyright information, logo, and navigation links to different parts of the site or external resources like GitHub.</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/AccountSettingsModal.jsx'>AccountSettingsModal.jsx</a></b></td>
							<td style='padding: 8px;'>A modal component allowing logged-in users to manage their account settings, including updating their display name and profile picture (with cropping functionality).</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ProfileMenu.jsx'>ProfileMenu.jsx</a></b></td>
							<td style='padding: 8px;'>Displays a user profile menu (typically triggered by an avatar icon) providing options like accessing account settings and signing out. It uses the AuthContext to get user information and actions.</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/AppAppBar.jsx'>AppAppBar.jsx</a></b></td>
							<td style='padding: 8px;'>Renders the main application navigation bar. Includes the site logo, navigation links, theme toggling button, and authentication actions (Login/Sign Up buttons or Profile Menu).</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ToggleColorMode.jsx'>ToggleColorMode.jsx</a></b></td>
							<td style='padding: 8px;'>A simple component providing a button (typically with an icon) to toggle the application's color theme between light and dark modes.</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ConfirmationDialog.jsx'>ConfirmationDialog.jsx</a></b></td>
							<td style='padding: 8px;'>A reusable modal dialog component used to prompt the user for confirmation before performing a potentially destructive action (e.g., deleting data).</code></td>
						</tr>
						<tr style='border-bottom: 1px solid #eee;'>
							<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/useTitle.js'>useTitle.js</a></b></td>
							<td style='padding: 8px;'>A custom React hook (`useTitle`) that updates the document's title when a component mounts and restores the previous title when it unmounts.</code></td>
						</tr>
					</table>
					<!-- CalcBasic Submodule -->
					<details>
						<summary><b>CalcBasic</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.CalcBasic</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/CalcBasic/hooks.js'>hooks.js</a></b></td>
									<td style='padding: 8px;'>Contains custom React hooks specifically for the calcBasic feature, including logic for performing the calculation simulation.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/CalcBasic/index.js'>index.js</a></b></td>
									<td style='padding: 8px;'>Acts as an index file for the CalcBasic components directory, exporting all components (`CalcForm`, `ResultsDisplay`, `CalcTitle`) for easier importing elsewhere.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/CalcBasic/CalcTitle.jsx'>CalcTitle.jsx</a></b></td>
									<td style='padding: 8px;'>A simple component displaying the title and a brief description for the calcBasic-web feature.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/CalcBasic/ResultsDisplay.jsx'>ResultsDisplay.jsx</a></b></td>
									<td style='padding: 8px;'>Displays the results of the calcBasic simulation, showing the lowest number of tickets bought and how many times that occurred, or a welcome message if no simulation has run.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/CalcBasic/CalcForm.jsx'>CalcForm.jsx</a></b></td>
									<td style='padding: 8px;'>Provides the user interface (form inputs and button) for the calcBasic feature, allowing users to input simulation parameters and trigger the calculation.</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- ManualBudget Submodule -->
					<details>
						<summary><b>ManualBudget</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
									<code><b>⦿ src.components.ManualBudget</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/EntryList.jsx'>EntryList.jsx</a></b></td>
									<td style='padding: 8px;'>Displays a list of budget entries for a selected category and month. Allows adding new entries and potentially editing/deleting existing ones via an `EntryMenu`.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/MonthSelectorModal.jsx'>MonthSelectorModal.jsx</a></b></td>
									<td style='padding: 8px;'>A modal component allowing the user to select a specific month/year for budgeting or add a new month to the budget data.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/EditCategoryModal.jsx'>EditCategoryModal.jsx</a></b></td>
									<td style='padding: 8px;'>A modal component allowing the user to rename an existing budget category.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/RemoveCategoryDialog.jsx'>RemoveCategoryDialog.jsx</a></b></td>
									<td style='padding: 8px;'>A confirmation dialog specifically for confirming the deletion of a budget category and its associated entries.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/AddCategoryModal.jsx'>AddCategoryModal.jsx</a></b></td>
									<td style='padding: 8px;'>A modal component allowing the user to add a new budget category.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/Welcome.jsx'>Welcome.jsx</a></b></td>
									<td style='padding: 8px;'>Displays a welcome message to the user in the Manual Budget section, prompting them to select or create a category if none is selected.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/AddEntryModal.jsx'>AddEntryModal.jsx</a></b></td>
									<td style='padding: 8px;'>A modal component containing a form to add a new budget entry (amount, description, date) to a selected category.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/CategorySelector.jsx'>CategorySelector.jsx</a></b></td>
									<td style='padding: 8px;'>A dropdown/select component allowing the user to choose from available budget categories. Includes an option to trigger editing the selected category.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/BudgetGraphsModal.jsx'>BudgetGraphsModal.jsx</a></b></td>
									<td style='padding: 8px;'>A modal component displaying budget data visualizations using tabs for 'Total Budget', 'Categories', and potentially 'Specific Category' details, fetched from Firestore.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/EntryMenu.jsx'>EntryMenu.jsx</a></b></td>
									<td style='padding: 8px;'>A menu component (triggered by an icon button on a budget entry) providing options to edit or delete that specific entry.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/LoginPrompt.jsx'>LoginPrompt.jsx</a></b></td>
									<td style='padding: 8px;'>Displays a message prompting the user to log in or sign up to use the Manual Budget feature, providing buttons to open the respective modals.</code></td>
								</tr>
							</table>
							<!-- BudgetGraphs Submodule -->
							<details>
								<summary><b>BudgetGraphs</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.components.ManualBudget.BudgetGraphs</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/BudgetGraphs/SpecificCategoryTab.jsx'>SpecificCategoryTab.jsx</a></b></td>
											<td style='padding: 8px;'>Renders the content for the 'Specific Category' tab within the BudgetGraphsModal, displaying a bar chart comparing spent vs. goal for the selected category.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/BudgetGraphs/utils.jsx'>utils.jsx</a></b></td>
											<td style='padding: 8px;'>Contains utility functions used within the BudgetGraphs components, such as generating random colors and validating month strings.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/BudgetGraphs/TabPanel.jsx'>TabPanel.jsx</a></b></td>
											<td style='padding: 8px;'>A helper component used with MUI Tabs to conditionally render the content of the currently active tab panel.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/BudgetGraphs/CustomTooltips.jsx'>CustomTooltips.jsx</a></b></td>
											<td style='padding: 8px;'>Defines custom tooltip components for use with Recharts graphs within the BudgetGraphsModal, to format currency or display specific data points.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/BudgetGraphs/TotalBudgetTab.jsx'>TotalBudgetTab.jsx</a></b></td>
											<td style='padding: 8px;'>Renders the content for the 'Total Budget' tab within the BudgetGraphsModal, displaying a bar chart comparing total spent vs. total goal for the month.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/BudgetGraphs/CategoriesTab.jsx'>CategoriesTab.jsx</a></b></td>
											<td style='padding: 8px;'>Renders the content for the 'Categories' tab within the BudgetGraphsModal, displaying a pie chart showing the distribution of spending across different categories.</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
							<!-- utils Submodule -->
							<details>
								<summary><b>utils</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.components.ManualBudget.utils</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/utils/budgetUtils.js'>budgetUtils.js</a></b></td>
											<td style='padding: 8px;'>Contains utility functions specifically related to budget calculations or data manipulation for the Manual Budget feature.</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
							<!-- shared Submodule -->
							<details>
								<summary><b>shared</b></summary>
								<blockquote>
									<div class='directory-path' style='padding: 8px 0; color: #666;'>
										<code><b>⦿ src.components.ManualBudget.shared</b></code>
									<table style='width: 100%; border-collapse: collapse;'>
									<thead>
										<tr style='background-color: #f8f9fa;'>
											<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
											<th style='text-align: left; padding: 8px;'>Summary</th>
										</tr>
									</thead>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/shared/ColorPicker.jsx'>ColorPicker.jsx</a></b></td>
											<td style='padding: 8px;'>A reusable component providing a color selection interface, used for assigning colors to budget categories.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/shared/DateInput.jsx'>DateInput.jsx</a></b></td>
											<td style='padding: 8px;'>A reusable component providing a date input field, used for selecting the date of a budget entry.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/ManualBudget/shared/MoneyInput.jsx'>MoneyInput.jsx</a></b></td>
											<td style='padding: 8px;'>A reusable input component specifically designed for entering monetary values, including formatting and validation for currency.</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<!-- LandingPage Submodule -->
					<details>
						<summary><b>LandingPage</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.LandingPage</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/LandingPage/Testimonials.jsx'>Testimonials.jsx</a></b></td>
									<td style='padding: 8px;'>Displays a section on the landing page showcasing user testimonials in a card format.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/LandingPage/FAQ.jsx'>FAQ.jsx</a></b></td>
									<td style='padding: 8px;'>Displays a Frequently Asked Questions (FAQ) section on the landing page using MUI Accordion components.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/LandingPage/Features.jsx'>Features.jsx</a></b></td>
									<td style='padding: 8px;'>Displays a section on the landing page highlighting key features or projects, often using a tabbed or card-based layout with descriptions and images/links.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/LandingPage/PastWebsites.jsx'>PastWebsites.jsx</a></b></td>
									<td style='padding: 8px;'>Displays a section on the landing page showcasing past website projects, similar in structure to the Features component.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/LandingPage/Me.jsx'>Me.jsx</a></b></td>
									<td style='padding: 8px;'>Displays the main hero/introduction section on the landing page, including a welcome message, personal introduction, and profile picture.</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- Authentication Submodule -->
					<details>
						<summary><b>Authentication</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.components.Authentication</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/Authentication/ForgotPasswordModal.jsx'>ForgotPasswordModal.jsx</a></b></td>
											<td style='padding: 8px;'>A modal component containing a form for users to request a password reset email via Firebase Authentication.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/Authentication/LoginModal.jsx'>LoginModal.jsx</a></b></td>
											<td style='padding: 8px;'>A modal component containing a form for users to log in using email/password via Firebase Authentication. Includes links to sign up or reset password.</code></td>
										</tr>
										<tr style='border-bottom: 1px solid #eee;'>
											<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/components/Authentication/SignUpModal.jsx'>SignUpModal.jsx</a></b></td>
											<td style='padding: 8px;'>A modal component containing a form for users to sign up for a new account using email/password via Firebase Authentication. Includes a link to log in.</code></td>
										</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<!-- hooks Submodule -->
					<details>
						<summary><b>hooks</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.hooks</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/hooks/useModal.js'>useModal.js</a></b></td>
									<td style='padding: 8px;'>A custom React hook (`useModal`) simplifying the management of modal open/close state. Returns the state variable and functions to open and close the modal.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/hooks/useManualBudgetData.js'>useManualBudgetData.js</a></b></td>
									<td style='padding: 8px;'>A custom React hook managing the state and Firestore interactions for the Manual Budget feature. Handles fetching/updating categories, entries, user name, and current month data.</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
					<!-- pages Submodule -->
					<details>
						<summary><b>pages</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ src.pages</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/pages/YTThumb.jsx'>YTThumb.jsx</a></b></td>
									<td style='padding: 8px;'>Renders the page for the 'YTThumb' feature, allowing users to input a YouTube video URL and retrieve/download its thumbnail image.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/pages/CalcBasic.jsx'>CalcBasic.jsx</a></b></td>
									<td style='padding: 8px;'>Renders the page for the 'calcBasic-web' feature. Integrates the `CalcTitle`, `CalcForm`, and `ResultsDisplay` components to provide the simulation interface and display results.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/pages/ManualBudget.jsx'>ManualBudget.jsx</a></b></td>
									<td style='padding: 8px;'>Renders the main page for the 'Manual Budget' feature. Manages overall layout, state (selected category, modals), user authentication checks, and integrates various ManualBudget components (`CategorySelector`, `EntryList`, `Welcome`, etc.).</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/src/pages/LandingPage.jsx'>LandingPage.jsx</a></b></td>
									<td style='padding: 8px;'>Renders the application's main landing page. Composes various sections like `Me`, `Features`, `Testimonials`, `FAQ`, and `PastWebsites` along with the `AppAppBar` and `Footer`.</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<!-- .github Submodule -->
			<details>
				<summary><b>.github</b></summary>
				<blockquote>
					<div class='directory-path' style='padding: 8px 0; color: #666;'>
						<code><b>⦿ .github</b></code>
					<!-- workflows Submodule -->
					<details>
						<summary><b>workflows</b></summary>
						<blockquote>
							<div class='directory-path' style='padding: 8px 0; color: #666;'>
								<code><b>⦿ .github.workflows</b></code>
							<table style='width: 100%; border-collapse: collapse;'>
							<thead>
								<tr style='background-color: #f8f9fa;'>
									<th style='width: 30%; text-align: left; padding: 8px;'>File Name</th>
									<th style='text-align: left; padding: 8px;'>Summary</th>
								</tr>
							</thead>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/.github/workflows/firebase-hosting-pull-request.yml'>firebase-hosting-pull-request.yml</a></b></td>
									<td style='padding: 8px;'>GitHub Actions workflow that automatically builds the project and deploys it to a Firebase Hosting preview channel when a pull request is opened or updated.</code></td>
								</tr>
								<tr style='border-bottom: 1px solid #eee;'>
									<td style='padding: 8px;'><b><a href='https://github.com/yummydirtx/theJunkyard/blob/main/.github/workflows/firebase-hosting-merge.yml'>firebase-hosting-merge.yml</a></b></td>
									<td style='padding: 8px;'>GitHub Actions workflow that automatically builds the project and deploys it to the live Firebase Hosting site when changes are pushed to the main branch.</code></td>
								</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</details>

---

## 🔵 Getting Started

### 🟣 Prerequisites

This project requires the following dependencies:

- **Programming Language:** JavaScript
- **Package Manager:** Npm

### ⚫ Installation

Build theJunkyard from the source and intsall dependencies:

1. **Clone the repository:**

    ```sh
    ❯ git clone https://github.com/yummydirtx/theJunkyard
    ```

2. **Navigate to the project directory:**

    ```sh
    ❯ cd theJunkyard
    ```

3. **Install the dependencies:**


	```sh
	❯ npm install
	```

### ⚪ Usage

Run the project with:

**Using [npm](https://www.npmjs.com/):**
```sh
npm start
```

---

## 🌟 Roadmap

- [X] **`Phase 1`**: <strike>Implement Landing Page structure and basic components.</strike>
- [X] **`Phase 2`**: <strike>Add Light/Dark Theme toggle and persistence.</strike>
- [X] **`Phase 3`**: <strike>Integrate CalcBasic lottery simulation.</strike>
- [X] **`Phase 4`**: <strike>Add YouTube Thumbnail Downloader utility.</strike>
- [X] **`Phase 5`**: <strike>Develop Manual Budget feature with Firebase backend.</strike>
- [ ] **`Future`**: Add Expense Report page for generating itemized expense lists.
- [ ] **`Future`**: Implement individual project detail pages.
- [ ] **`Future`**: Add website favicon downloader utility.

---

## 🤝 Contributing

- **🐛 [Report Issues](https://github.com/yummydirtx/theJunkyard/issues)**: Submit bugs found or log feature requests for the `theJunkyard` project.
- **💡 [Submit Pull Requests](https://github.com/yummydirtx/theJunkyard/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/yummydirtx/theJunkyard
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

---

## 📜 License

Copyright (c) 2025 Alex Frutkin

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (theJunkyard), to deal in theJunkyard without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of theJunkyard, and to permit persons to whom theJunkyard is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of theJunkyard. THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

<div align="right">

[![][back-to-top]](#top)

</div>


[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square


---

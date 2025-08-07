# Pokedex
This Pokédex app lets users explore and search for Pokémon by fetching real-time data from an external API. It's a lightweight and interactive tool for any Pokémon fan.

## User Instructions

The application features the following screen:

![image](https://github.com/user-attachments/assets/765e0a7d-ca21-41d4-a888-53453dfff942)

Where the user can perform the following actions:

1. Upon entering, a Pokémon will be displayed in the **Information** section, showing relevant data such as name, height, weight, species, photo, evolution chain, etc.  
   ![image](https://github.com/user-attachments/assets/349a6e6e-7b69-49cf-aa95-d03a6d212986)

2. On the left side of the screen, there is a slide-out menu where the user can select any desired Pokémon to view its information.  
   ![image](https://github.com/user-attachments/assets/53e1eb4c-de2d-429d-abbe-9abf5ad0ca0f)

3. In the slide-out menu, the user can scroll to the bottom to load more Pokémon as they go down. 20 Pokémon are loaded at a time until all are displayed.  
   ![image](https://github.com/user-attachments/assets/4d114a7e-f8b0-4ce7-b6e1-dde98c8cb155)

4. Any Pokémon can be selected from the menu, and upon selection, its information will appear in the **Information** section.  
   ![image](https://github.com/user-attachments/assets/2570d6ec-dd24-4444-af45-946ba3b431dd)

5. Hovering the mouse cursor over the magnifying glass icon (search icon) at the top right of the white section will display a search bar where the user can type the desired Pokémon name.  
   It’s important to mention that the search is triggered while typing, with a short delay that waits for typing to stop before performing the search—this is done to avoid overloading the API.  
   The search is also performed using **partial matches**, so it’s not necessary to type the full name exactly. It is **not case-sensitive**, so uppercase and lowercase letters don’t affect results.  
   ![image](https://github.com/user-attachments/assets/9138c166-4272-40ca-b378-ccfb2257c2aa)

   As the user types, the results will appear in the slide-out menu on the left.  
   ![image](https://github.com/user-attachments/assets/de983857-e30c-4a2a-8afd-5a571bc7b675)

6. Deleting the search text will restore the previously displayed Pokémon list in the slide-out menu.  
   ![image](https://github.com/user-attachments/assets/e4bb32c7-18e0-4373-9067-e9d916a92805)

---

## Technical Instructions

The program was developed using the following tech stack:

- **NextJS (ReactJS):** for the frontend.
- **TailwindCSS:** for styling.
- **TypeScript:** as the programming language.
- **Docker:** to containerize the app and simplify deployment without dependency conflicts.
- **Vercel:** as the CI/CD and hosting platform.
- **Git / GitHub:** as version control, integrated with Vercel for automatic deployments.

---

### Install or Display Options

To view the solution, you have the following options listed from fastest and easiest to most manual:

1. **Hosted page accessible from any device:**  
   [https://pokedex-zeta-woad.vercel.app/](https://pokedex-zeta-woad.vercel.app/)

---

2. **Docker image with the pre-built site**

   Only requirement: **Docker**, which you can download from the official website:  
   [Docker Official Website](https://www.docker.com/)

   Once installed, run the following command:
   ```bash
   docker run -p 3000:3000 joctan04/pokedex-ui:latest
   ```

Then open the browser and go to:
`http://localhost:3000` or `http://127.0.0.1:3000`

---

3. **Manual compilation of the project**

   Requirements:

   * **Git**: to clone the repository.
   * **Node.js** (recommended version: 18.x or higher): also includes npm.
   * **npm**: Node.js package manager (automatically installed with Node.js).

   Steps:

   1. Clone the repository:

      ```bash
      git clone https://github.com/joctan-tec/pokedex.git
      cd pokedex
      ```

   2. Install dependencies:

      ```bash
      npm install
      ```

   3. Run the development server:

      ```bash
      npm run dev
      ```

   4. Open your browser and go to:
      `http://localhost:3000` or `http://127.0.0.1:3000`

---

## Important Note About Search Functionality

Since the API does not provide native search functionality, a custom solution was implemented using a **key-value dictionary**, where the key is the Pokémon name and the value is the ID.

A search system was built to simulate a **Full Text Search**, enabling **partial match** lookups across all names. This allows for quicker and more efficient retrieval of Pokémon data without needing to make excessive API calls.

Also worth mentioning: the list of Pokémon names and IDs was extracted directly from the **PokeAPI** and processed using a **Python script** to generate a simplified file. This reduced the file size from **125KB** to just **30KB**.

## Duration

The project was completed in approximately **9 hours**.

Distributed as follows:
| **Duration**             | **Activity**                                      |
|--------------------------|---------------------------------------------------|
| 30 minutes               | Initial setup and planning                        |
| 1 hour and 30 minutes    | Planning, research, and building the web interface|
| 5 hours                  | Application development                           |
| 1 hour                   | Testing, debugging, and deployment                |
| 1 hour                   | Writing documentation and final review            |




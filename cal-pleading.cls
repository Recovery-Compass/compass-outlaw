
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{cal-pleading}[2025/12/12 v26.0 Geometry Fixed]
\LoadClass[12pt]{article}

% --- CORE METRICS ---
\RequirePackage{fontspec}
\setmainfont{Times New Roman}
\RequirePackage[absolute]{textpos}
\setlength{\TPHorizModule}{1bp}
\setlength{\TPVertModule}{1bp}
\textblockorigin{0bp}{0bp} % HARD LOCK: (0,0) is Top Left

% --- GEOMETRY ---
\RequirePackage[letterpaper, top=1in, bottom=0.5in, left=1.35in, right=1in]{geometry}
\newlength{\pleadingline}
\setlength{\pleadingline}{24bp}
\setlength{\baselineskip}{\pleadingline}
\setlength{\parskip}{0pt}
\setlength{\lineskiplimit}{-\maxdimen} 
\setlength{\lineskip}{0pt}

% --- VISUAL RAILS (TOP-DOWN LOCK) ---
\RequirePackage{tikz}
\RequirePackage{background}
\backgroundsetup{
  scale=1, color=black, opacity=1, angle=0,
  position=current page.north west,
  contents={
    \begin{tikzpicture}[remember picture, overlay]
      % RAILS (Draw from Top down using negative Y)
      \draw[line width=1pt] (1.30in, -0.5in) -- (1.30in, -10.5in);
      \draw[line width=0.5pt] (1.23in, -0.5in) -- (1.23in, -10.5in);
      
      % LINE NUMBERS (Calculated from Top Margin)
      \foreach \y in {1,...,28} {
         \node[anchor=base east, font=\footnotesize] 
         at (1.15in, {-1.0in - (\y-1)*24bp - 12bp}) {\y}; 
      }
      % FOOTER RULE
      \draw[line width=0.5pt] (0.5in, -10.5in) -- (8.0in, -10.5in);
    \end{tikzpicture}
  }
}

% --- CAPTION MACRO (ONE LEGAL STYLE) ---
\newcommand{\makecaption}[5]{
    \thispagestyle{empty}
    
    % CONTACT BLOCK (Locked to Line 1)
    \begin{textblock}{500}(97, 72)
    \noindent #1
    \end{textblock}

    % COURT TITLE (Locked to Line 8)
    \begin{textblock}{418}(97, 240)
    \begin{center}
    \textbf{SUPERIOR COURT OF THE STATE OF CALIFORNIA}\\
    \textbf{COUNTY OF LOS ANGELES}
    \end{center}
    \end{textblock}

    % CAPTION TABLE (Locked to Line 11)
    \begin{textblock}{468}(97, 312)
    \noindent
    \renewcommand{\arraystretch}{1.2}
    \begin{tabular}{p{2.8in} c p{2.8in}}
    % LEFT: Parties
    \begin{minipage}[t][3.0in]{2.8in}
    In the Matter of the Arbitration between:\\ \\
    \textbf{#2}, \\ Client/Petitioner, \\ \\
    vs. \\ \\
    \textbf{#3}, \\ Attorney/Respondent.
    \end{minipage} 
    & 
    % MIDDLE: The "One Legal" Parentheses Rail
    \begin{minipage}[t][3.0in]{0.15in}
    \centering
    \textbf{)} \\ \textbf{)} \\ \textbf{)} \\ \textbf{)} \\ \textbf{)} \\ \textbf{)} \\ \textbf{)} \\ \textbf{)} \\ \textbf{)}
    \end{minipage}
    & 
    % RIGHT: Case Info
    \begin{minipage}[t][3.0in]{2.8in}
    \textbf{CASE NO:} #4 \\ \\
    \textbf{#5} \\ \\
    Hearing Date: TBD \\
    Dept: Fee Arbitration
    \end{minipage} 
    \end{tabular}
    \end{textblock}
    
    % FOOTER TITLE
    \begin{textblock}{500}(97, 760)
    \centering \footnotesize #5
    \end{textblock}
    
    % Force Body Start
    \vspace*{490bp}
}

# ŠVP PV Application Specification

This directory contains the complete, unambiguous technical and functional specifications for the ŠVP PV Web Application. This documentation serves as the single source of truth (SSoT) for engineering, AI code generation, and database schema design.

## System Overview

**ŠVP PV** is a modern, web-based assistant application that helps kindergartens to create ŠVP PV based on RVP:

- It runs locally on user's computer without need of internet connection.

- ŠVP PV is a document for kindergartens that defines educational program of a kindergarten. It is based on the RVP (Rámcový vzdělávací program), which is the state framework for education in Czech Republic. The document is approved by the Czech Ministry of Education.

- The main source of truth for ŠVP PV is the document '/specs/Předškolní vzdělávání Závazná část RVP + metodická podpora.pdf' 

- RVP PV is a document that defines the framework for preschool education in Czech Republic. It is based on the RVP (Rámcový vzdělávací program), which is the state framework for education in Czech Republic. The document is approved by the Czech Ministry of Education.

- The ŠVP PV application:
    - has UI fully in Czech language.
    - supports creation of ŠVP PV based on RVP PV
    - UI allows visual connection (drag and drop) of key comptencies (klíčové kompetence) with expected learning outcomes (očekávané výsledky učení) and activities (činnosti).
    
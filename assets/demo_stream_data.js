// Curated OCR token sequence and ground truth for Unlimited-OCR paper pages
// Coordinates are in [x1, y1, x2, y2] normalized to 0..1000 scale

const DEMO_DATA = {
  "unlimited_paper_main": {
    "title": "Unlimited-OCR: Pages 7, 8 & 9 (OmniDocBench & Experimental Settings)",
    "pages": [
      {
        "pageNumber": 7,
        "image": "assets/pages/page_7.png",
        "aspectRatio": 1241 / 1754,
        "blocks": [
          {
            "id": "p7-b1",
            "category": "text",
            "bbox": [113, 118, 885, 178],
            "content": "is reserved exclusively for the compressed tokens. This design keeps the activation values low when decoding, which helps stabilize attention weights and maintain accuracy."
          },
          {
            "id": "p7-b2",
            "category": "text",
            "bbox": [113, 192, 885, 275],
            "content": "In Unlimited OCR it stays fixed. This joint stability in both computational cost and memory footprint is precisely what makes long-horizon parsing possible."
          },
          {
            "id": "p7-b3",
            "category": "image",
            "bbox": [499, 602, 872, 803],
            "content": "[Figure 3: Attention kernel latency vs sequence length]"
          },
          {
            "id": "p7-b4",
            "category": "image_caption",
            "bbox": [494, 814, 884, 847],
            "content": "Figure 3 | The latency of the Flash Attention v3 kernel as decoding length increases."
          },
          {
            "id": "p7-b5",
            "category": "page_number",
            "bbox": [483, 926, 505, 935],
            "content": "7"
          }
        ]
      },
      {
        "pageNumber": 8,
        "image": "assets/pages/page_8.png",
        "aspectRatio": 1241 / 1754,
        "blocks": [
          {
            "id": "p8-b1",
            "category": "title",
            "bbox": [114, 101, 367, 119],
            "content": "4. Experimental Settings"
          },
          {
            "id": "p8-b2",
            "category": "title",
            "bbox": [114, 133, 202, 150],
            "content": "4.1. Data Engine"
          },
          {
            "id": "p8-b3",
            "category": "text",
            "bbox": [113, 159, 885, 273],
            "content": "We construct approximately 2 million document OCR data samples to train Unlimited OCR, with a 9:1 ratio of single-page to multi-page data. For the single-page PDF data, we use Paddle OCR [11] for annotation, concatenating the coordinates and content of each block to construct end-to-end detection and parsing ground truth. The coordinates of each element are normalized to the range of 0-1000. All multi-page data are synthesized by concatenating single-page data. We randomly generate around 200K samples, each consisting of 2 to 50 pages, with <page> used as a separator between pages. All data are packed into a sequence length of 32K tokens."
          },
          {
            "id": "p8-b4",
            "category": "title",
            "bbox": [114, 298, 357, 312],
            "content": "4.2. Implementation Details"
          },
          {
            "id": "p8-b5",
            "category": "text",
            "bbox": [113, 322, 885, 483],
            "content": "Starting from the DeepSeek OCR checkpoint [34], we continue training Unlimited OCR for 4,000 steps with a global batch size of 256 and a maximum sequence length of 32K on 8x16 A800 GPUs, using random packing for all data. During training, we freeze the DeepEncoder and only train the LLM parameters, as the DeepEncoder is already sufficiently optimized in DeepSeek OCR. We use the AdamW [21] optimizer and a cosine annealing scheduler [20] with an initial learning rate of 1e-4. To support 32K training, we adopt DeepEP [18], with expert parallelism (EP) set to 4. The entire training pipeline is built on the Megatron-LM [27] framework. For inference, we implement KV cache management for R-SWA in the Transformers library, along with corresponding support and optimizations in the SGLang inference engine. Both inference frameworks can operate Unlimited OCR under constant TPS (tokens/S) and GPU memory."
          },
          {
            "id": "p8-b6",
            "category": "title",
            "bbox": [114, 508, 258, 525],
            "content": "5. Evaluation"
          },
          {
            "id": "p8-b7",
            "category": "title",
            "bbox": [114, 541, 357, 558],
            "content": "5.1. Benchmark and Metrics"
          },
          {
            "id": "p8-b8",
            "category": "text",
            "bbox": [113, 567, 884, 695],
            "content": "We select OmniDocBench [23] as the main benchmark for evaluating foundational document OCR capabilities, and test the Unlimited OCR on both v1.5 and v1.6 versions. OmniDocBench v1.6 includes 296 more test images than v1.5 and represents the latest benchmark, while v1.5 provides official metrics from more classic models—including our baseline DeepSeek OCR—which facilitates performance comparisons. For long-horizon OCR evaluation, an in-house test set is constructed, where we select a number of novels, documents, and papers and divide them by page count to assess the multi-page performance of Unlimited OCR. Specifically, we select books of 2, 5, 10, 20, and 40+ pages for testing, with no fewer than five books for each category."
          },
          {
            "id": "p8-b9",
            "category": "page_number",
            "bbox": [485, 926, 505, 935],
            "content": "8"
          }
        ]
      },
      {
        "pageNumber": 9,
        "image": "assets/pages/page_9.png",
        "aspectRatio": 1241 / 1754,
        "blocks": [
          {
            "id": "p9-b1",
            "category": "title",
            "bbox": [114, 101, 884, 130],
            "content": "Table 1 | Comparison on OmniDocBench (v1.5/v1.6). All models in the table are end-to-end VLM-based architectures."
          },
          {
            "id": "p9-b2",
            "category": "table",
            "bbox": [113, 140, 885, 340],
            "content": "| Model | Overall Text | CDM | Formula | Table TEDS | Read Order (Edit Dist) |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n| GOT-OCR 2.0 | 83.21 | 85.4 | 74.2 | 76.9 | 0.124 |\n| DeepSeek OCR | 88.62 | 90.1 | 82.5 | 83.4 | 0.085 |\n| Unlimited OCR (Ours) | **91.45** | **92.8** | **86.1** | **87.2** | **0.061** |"
          },
          {
            "id": "p9-b3",
            "category": "text",
            "bbox": [113, 360, 885, 470],
            "content": "On the OmniDocBench, Unlimited OCR achieves 5580 TPS (tokens/s/512 concurrency) compared to DeepSeek OCR while reducing peak GPU memory by 68%. This confirms that the R-SWA attention mechanism delivers superior throughput and high fidelity across complex document elements without degradations."
          },
          {
            "id": "p9-b4",
            "category": "page_number",
            "bbox": [485, 926, 505, 935],
            "content": "9"
          }
        ]
      }
    ]
  },
  "page_1_abstract": {
    "title": "Unlimited-OCR: Page 1 (Title & Abstract)",
    "pages": [
      {
        "pageNumber": 1,
        "image": "assets/pages/page_1.png",
        "aspectRatio": 1241 / 1754,
        "blocks": [
          {
            "id": "p1-b1",
            "category": "title",
            "bbox": [360, 138, 640, 157],
            "content": "Unlimited OCR Works"
          },
          {
            "id": "p1-b2",
            "category": "title",
            "bbox": [290, 165, 709, 179],
            "content": "Welcome the Era of One-shot Long-horizon Parsing"
          },
          {
            "id": "p1-b3",
            "category": "title",
            "bbox": [460, 216, 543, 229],
            "content": "Baidu Inc."
          },
          {
            "id": "p1-b4",
            "category": "title",
            "bbox": [452, 277, 548, 294],
            "content": "Abstract"
          },
          {
            "id": "p1-b5",
            "category": "text",
            "bbox": [118, 321, 883, 488],
            "content": "Recently, end-to-end OCR models, exemplified by DeepSeek OCR, have once again thrust OCR into the spotlight. A widely held view is that employing a large language model (LLM) as the decoder allows the model to leverage the prior distribution of language, leading to improved OCR performance. However, the downside is equally evident: as the output sequence lengthens, the accumulated KV cache drives up memory consumption and progressively slows down generation. This stands in stark contrast to humans, who exhibit no such decline in efficiency during long-horizon copying tasks. In this technical report, we propose Unlimited OCR, a model designed to emulate human parsing working memory. Taking DeepSeek OCR as the baseline, we replace all attention layers in the decoder with our proposed Reference Sliding Window Attention (R-SWA), which reduces attention computation costs while maintaining a constant memory footprint."
          }
        ]
      }
    ]
  },
  "krushna_resume": {
      "title": "Krushna_GenAi_Resume.pdf",
      "pages": [
          {
              "pageNumber": 1,
              "image": "assets/pages/krushna_resume_p1.png",
              "aspectRatio": 0.7068793426296783,
              "blocks": [
                  {
                      "id": "p1-b1",
                      "category": "title",
                      "bbox": [
                          77,
                          62,
                          564,
                          99
                      ],
                      "content": "KRUSHNA JADHAV"
                  },
                  {
                      "id": "p1-b2",
                      "category": "title",
                      "bbox": [
                          77,
                          116,
                          323,
                          132
                      ],
                      "content": "Python GenAI Engineer"
                  },
                  {
                      "id": "p1-b3",
                      "category": "title",
                      "bbox": [
                          765,
                          23,
                          911,
                          38
                      ],
                      "content": "+91 7821871883"
                  },
                  {
                      "id": "p1-b4",
                      "category": "text",
                      "bbox": [
                          697,
                          60,
                          901,
                          75
                      ],
                      "content": "kjpatil045@gmail.com"
                  },
                  {
                      "id": "p1-b5",
                      "category": "text",
                      "bbox": [
                          726,
                          96,
                          904,
                          110
                      ],
                      "content": "Chh.Sambhajinagar"
                  },
                  {
                      "id": "p1-b6",
                      "category": "text",
                      "bbox": [
                          59,
                          136,
                          915,
                          173
                      ],
                      "content": "www.linkedin.com/in/krushna-jadhav-2183a3267"
                  },
                  {
                      "id": "p1-b7",
                      "category": "title",
                      "bbox": [
                          425,
                          220,
                          582,
                          238
                      ],
                      "content": "SUMMARY"
                  },
                  {
                      "id": "p1-b8",
                      "category": "text",
                      "bbox": [
                          70,
                          256,
                          956,
                          284
                      ],
                      "content": "Entry-Level Python GenAI Engineer with hands-on experience building AI-powered applications using Python, \nFastAPI, Generative AI, OCR, RAG, and LangChain. Experienced in developing REST APIs, integrating LLMs for"
                  },
                  {
                      "id": "p1-b9",
                      "category": "text",
                      "bbox": [
                          71,
                          287,
                          956,
                          299
                      ],
                      "content": "intelligent text extraction and conversational applications, and building AI-driven automation solutions. Familiar"
                  },
                  {
                      "id": "p1-b10",
                      "category": "text",
                      "bbox": [
                          210,
                          304,
                          818,
                          316
                      ],
                      "content": "with Docker, CI/CD, LangSmith, prompt engineering, and AI/ML workflows."
                  },
                  {
                      "id": "p1-b11",
                      "category": "title",
                      "bbox": [
                          74,
                          366,
                          256,
                          385
                      ],
                      "content": "EDUCATION"
                  },
                  {
                      "id": "p1-b12",
                      "category": "text",
                      "bbox": [
                          74,
                          413,
                          382,
                          426
                      ],
                      "content": "Deogiri Collage Chh.Sambhajinagar"
                  },
                  {
                      "id": "p1-b13",
                      "category": "text",
                      "bbox": [
                          74,
                          432,
                          308,
                          456
                      ],
                      "content": "Bachelor's Of Computer Application \n2022-2025"
                  },
                  {
                      "id": "p1-b14",
                      "category": "text",
                      "bbox": [
                          74,
                          486,
                          382,
                          499
                      ],
                      "content": "Deogiri Collage Chh.Sambhajinagar"
                  },
                  {
                      "id": "p1-b15",
                      "category": "text",
                      "bbox": [
                          59,
                          505,
                          298,
                          557
                      ],
                      "content": "Master’s Of Computer Application \n2025-2027"
                  },
                  {
                      "id": "p1-b16",
                      "category": "title",
                      "bbox": [
                          74,
                          563,
                          180,
                          581
                      ],
                      "content": "SKILLS"
                  },
                  {
                      "id": "p1-b17",
                      "category": "text",
                      "bbox": [
                          90,
                          595,
                          344,
                          606
                      ],
                      "content": "Languages: Python, SQL, JavaScript"
                  },
                  {
                      "id": "p1-b18",
                      "category": "text",
                      "bbox": [
                          90,
                          609,
                          324,
                          620
                      ],
                      "content": "ML & AI: Machine Learning, Deep"
                  },
                  {
                      "id": "p1-b19",
                      "category": "text",
                      "bbox": [
                          102,
                          623,
                          333,
                          633
                      ],
                      "content": "Learning, NLP, Generative AI, RAG"
                  },
                  {
                      "id": "p1-b20",
                      "category": "text",
                      "bbox": [
                          90,
                          637,
                          362,
                          647
                      ],
                      "content": "Frameworks: FastAPI, Flask, Streamlit,"
                  },
                  {
                      "id": "p1-b21",
                      "category": "text",
                      "bbox": [
                          102,
                          651,
                          250,
                          661
                      ],
                      "content": "LangChain, REST-API"
                  },
                  {
                      "id": "p1-b22",
                      "category": "text",
                      "bbox": [
                          90,
                          665,
                          354,
                          676
                      ],
                      "content": "Libraries: Scikit-learn, Pandas, NumPy,"
                  },
                  {
                      "id": "p1-b23",
                      "category": "text",
                      "bbox": [
                          102,
                          679,
                          335,
                          689
                      ],
                      "content": "TensorFlow/PyTorch ,LangGraph"
                  },
                  {
                      "id": "p1-b24",
                      "category": "text",
                      "bbox": [
                          90,
                          694,
                          351,
                          704
                      ],
                      "content": "MLOps: Docker, MLflow, CI/CD,OCR"
                  },
                  {
                      "id": "p1-b25",
                      "category": "text",
                      "bbox": [
                          90,
                          707,
                          378,
                          717
                      ],
                      "content": "Data Tools: Databricks, SQL Server, ETL"
                  },
                  {
                      "id": "p1-b26",
                      "category": "text",
                      "bbox": [
                          102,
                          721,
                          167,
                          731
                      ],
                      "content": "Pipelines"
                  },
                  {
                      "id": "p1-b27",
                      "category": "text",
                      "bbox": [
                          90,
                          735,
                          342,
                          745
                      ],
                      "content": "Visualization: Power BI, Matplotlib,"
                  },
                  {
                      "id": "p1-b28",
                      "category": "text",
                      "bbox": [
                          102,
                          749,
                          158,
                          759
                      ],
                      "content": "Seaborn"
                  },
                  {
                      "id": "p1-b29",
                      "category": "text",
                      "bbox": [
                          90,
                          763,
                          300,
                          774
                      ],
                      "content": "Cloud: Microsoft Azure, AWS"
                  },
                  {
                      "id": "p1-b30",
                      "category": "text",
                      "bbox": [
                          90,
                          777,
                          322,
                          787
                      ],
                      "content": "Tools: Postman, LangSmith, n8n"
                  },
                  {
                      "id": "p1-b31",
                      "category": "title",
                      "bbox": [
                          74,
                          835,
                          327,
                          853
                      ],
                      "content": "CERTIFICATIONS"
                  },
                  {
                      "id": "p1-b32",
                      "category": "text",
                      "bbox": [
                          88,
                          861,
                          332,
                          871
                      ],
                      "content": "Oracle Cloud Infrastructure 2025"
                  },
                  {
                      "id": "p1-b33",
                      "category": "title",
                      "bbox": [
                          100,
                          874,
                          343,
                          885
                      ],
                      "content": "Certified Data Science Professional"
                  },
                  {
                      "id": "p1-b34",
                      "category": "text",
                      "bbox": [
                          88,
                          889,
                          299,
                          899
                      ],
                      "content": "Python Certification – GUVI"
                  },
                  {
                      "id": "p1-b35",
                      "category": "text",
                      "bbox": [
                          88,
                          903,
                          326,
                          913
                      ],
                      "content": "ChatGPT Prompt Engineering for"
                  },
                  {
                      "id": "p1-b36",
                      "category": "text",
                      "bbox": [
                          100,
                          917,
                          309,
                          927
                      ],
                      "content": "Developers – DeepLearning.AI"
                  },
                  {
                      "id": "p1-b37",
                      "category": "text",
                      "bbox": [
                          88,
                          931,
                          348,
                          941
                      ],
                      "content": "Career Essentials in Data Analysis –"
                  },
                  {
                      "id": "p1-b38",
                      "category": "text",
                      "bbox": [
                          100,
                          945,
                          254,
                          955
                      ],
                      "content": "Microsoft & LinkedIn"
                  },
                  {
                      "id": "p1-b39",
                      "category": "title",
                      "bbox": [
                          479,
                          327,
                          610,
                          345
                      ],
                      "content": "PROJECT"
                  },
                  {
                      "id": "p1-b40",
                      "category": "text",
                      "bbox": [
                          479,
                          369,
                          874,
                          382
                      ],
                      "content": "MediGrid AI – Prescription Analysis System"
                  },
                  {
                      "id": "p1-b41",
                      "category": "text",
                      "bbox": [
                          505,
                          391,
                          963,
                          401
                      ],
                      "content": "Developed an AI-powered system to extract medicine details from"
                  },
                  {
                      "id": "p1-b42",
                      "category": "text",
                      "bbox": [
                          519,
                          405,
                          963,
                          429
                      ],
                      "content": "handwritten prescriptions using OCR and image processing \ntechniques"
                  },
                  {
                      "id": "p1-b43",
                      "category": "text",
                      "bbox": [
                          505,
                          433,
                          912,
                          443
                      ],
                      "content": "Built scalable REST APIs using FastAPI to process and store"
                  },
                  {
                      "id": "p1-b44",
                      "category": "text",
                      "bbox": [
                          519,
                          447,
                          861,
                          457
                      ],
                      "content": "structured prescription data in a SQLite database"
                  },
                  {
                      "id": "p1-b45",
                      "category": "text",
                      "bbox": [
                          505,
                          461,
                          941,
                          471
                      ],
                      "content": "Integrated Gemini AI for intelligent text extraction and medical"
                  },
                  {
                      "id": "p1-b46",
                      "category": "text",
                      "bbox": [
                          519,
                          475,
                          645,
                          485
                      ],
                      "content": "entity recognition"
                  },
                  {
                      "id": "p1-b47",
                      "category": "text",
                      "bbox": [
                          505,
                          489,
                          924,
                          499
                      ],
                      "content": "Implemented automated safety checks to generate alerts for"
                  },
                  {
                      "id": "p1-b48",
                      "category": "text",
                      "bbox": [
                          519,
                          503,
                          813,
                          513
                      ],
                      "content": "incorrect dosages and potential drug risks"
                  },
                  {
                      "id": "p1-b49",
                      "category": "text",
                      "bbox": [
                          505,
                          517,
                          962,
                          527
                      ],
                      "content": "Enabled pharmacy accessibility by generating location-based links"
                  },
                  {
                      "id": "p1-b50",
                      "category": "text",
                      "bbox": [
                          494,
                          531,
                          929,
                          555
                      ],
                      "content": "for nearby medical stores \nTechnologies: Python, FastAPI, Gemini AI, OCR (Tesseract), SQLite"
                  },
                  {
                      "id": "p1-b51",
                      "category": "text",
                      "bbox": [
                          475,
                          583,
                          899,
                          614
                      ],
                      "content": "AI-Based Document Automation Pipeline – BPCL \nCGD/LMC"
                  },
                  {
                      "id": "p1-b52",
                      "category": "text",
                      "bbox": [
                          490,
                          625,
                          968,
                          667
                      ],
                      "content": "• \nDeveloped a Python-based pipeline to process 1,400+ scanned \nPDFs using AWS Textract and convert extracted data into \nExcel."
                  },
                  {
                      "id": "p1-b53",
                      "category": "text",
                      "bbox": [
                          490,
                          678,
                          968,
                          706
                      ],
                      "content": "• \nBuilt OCR parsing and validation logic for 100+ document \nformats."
                  },
                  {
                      "id": "p1-b54",
                      "category": "text",
                      "bbox": [
                          490,
                          717,
                          968,
                          746
                      ],
                      "content": "• \nAutomated document processing using AWS S3, Lambda, \nSNS, and Textract."
                  },
                  {
                      "id": "p1-b55",
                      "category": "text",
                      "bbox": [
                          490,
                          757,
                          968,
                          785
                      ],
                      "content": "• \nUsed Pandas and OpenPyXL for data cleaning, transformation, \nand Excel generation."
                  },
                  {
                      "id": "p1-b56",
                      "category": "text",
                      "bbox": [
                          490,
                          796,
                          931,
                          811
                      ],
                      "content": "• \nReduced manual data-entry effort from hours to minutes."
                  },
                  {
                      "id": "p1-b57",
                      "category": "text",
                      "bbox": [
                          476,
                          825,
                          968,
                          849
                      ],
                      "content": "Technologies: Python, AWS Textract, AWS Lambda, Amazon S3, \nAmazon SNS, Pandas, OpenPyXL, OCR, ETL, Excel Automation"
                  },
                  {
                      "id": "p1-b58",
                      "category": "title",
                      "bbox": [
                          476,
                          866,
                          660,
                          884
                      ],
                      "content": "EXPERIENCE"
                  },
                  {
                      "id": "p1-b59",
                      "category": "text",
                      "bbox": [
                          475,
                          900,
                          579,
                          913
                      ],
                      "content": "Naresh IT"
                  },
                  {
                      "id": "p1-b60",
                      "category": "text",
                      "bbox": [
                          505,
                          929,
                          910,
                          939
                      ],
                      "content": "Data Science & Gen AI Intern (Trainee) – [Omkar"
                  },
                  {
                      "id": "p1-b61",
                      "category": "text",
                      "bbox": [
                          519,
                          941,
                          544,
                          951
                      ],
                      "content": "Sir]"
                  },
                  {
                      "id": "p1-b62",
                      "category": "text",
                      "bbox": [
                          505,
                          953,
                          909,
                          964
                      ],
                      "content": "Gained practical experience in data analysis, ML"
                  },
                  {
                      "id": "p1-b63",
                      "category": "text",
                      "bbox": [
                          519,
                          966,
                          774,
                          976
                      ],
                      "content": "models, and prompt engineering."
                  },
                  {
                      "id": "p1-b64",
                      "category": "text",
                      "bbox": [
                          505,
                          978,
                          878,
                          988
                      ],
                      "content": "Built mini projects using Python and AI tools."
                  }
              ]
          }
      ]
  },
  "scanned_notebook": {
      "title": "Scanned_20260907_122448.pdf",
      "pages": [
          {
              "pageNumber": 1,
              "image": "assets/pages/scanned_p1.png",
              "aspectRatio": 0.747,
              "blocks": [
                  {
                      "id": "p1-b1",
                      "category": "title",
                      "bbox": [
                          108,
                          39,
                          255,
                          60
                      ],
                      "content": "FIXED:"
                  },
                  {
                      "id": "p1-b2",
                      "category": "title",
                      "bbox": [
                          115,
                          95,
                          382,
                          121
                      ],
                      "content": "customes Name:"
                  },
                  {
                      "id": "p1-b3",
                      "category": "title",
                      "bbox": [
                          146,
                          145,
                          256,
                          171
                      ],
                      "content": "Aaron"
                  },
                  {
                      "id": "p1-b4",
                      "category": "title",
                      "bbox": [
                          256,
                          149,
                          394,
                          180
                      ],
                      "content": "Begman"
                  },
                  {
                      "id": "p1-b5",
                      "category": "title",
                      "bbox": [
                          150,
                          188,
                          255,
                          212
                      ],
                      "content": "Aaron"
                  },
                  {
                      "id": "p1-b6",
                      "category": "title",
                      "bbox": [
                          243,
                          184,
                          424,
                          222
                      ],
                      "content": "Hewkings"
                  },
                  {
                      "id": "p1-b7",
                      "category": "title",
                      "bbox": [
                          148,
                          225,
                          344,
                          258
                      ],
                      "content": "Adom Heot"
                  },
                  {
                      "id": "p1-b8",
                      "category": "title",
                      "bbox": [
                          147,
                          267,
                          366,
                          301
                      ],
                      "content": "Alan Bonnes"
                  },
                  {
                      "id": "p1-b9",
                      "category": "title",
                      "bbox": [
                          152,
                          312,
                          364,
                          346
                      ],
                      "content": "Alan Hwong"
                  },
                  {
                      "id": "p1-b10",
                      "category": "title",
                      "bbox": [
                          158,
                          358,
                          401,
                          399
                      ],
                      "content": "Alon shonely"
                  },
                  {
                      "id": "p1-b11",
                      "category": "title",
                      "bbox": [
                          594,
                          455,
                          680,
                          474
                      ],
                      "content": "5001C"
                  },
                  {
                      "id": "p1-b12",
                      "category": "title",
                      "bbox": [
                          728,
                          458,
                          904,
                          482
                      ],
                      "content": "ISD0K200K"
                  },
                  {
                      "id": "p1-b13",
                      "category": "text",
                      "bbox": [
                          64,
                          480,
                          789,
                          525
                      ],
                      "content": "·Show each Customer's tofal Saleo usir"
                  },
                  {
                      "id": "p1-b14",
                      "category": "text",
                      "bbox": [
                          112,
                          524,
                          890,
                          567
                      ],
                      "content": "FrxeoD exptesio,eqeedless ofthe"
                  },
                  {
                      "id": "p1-b15",
                      "category": "text",
                      "bbox": [
                          107,
                          564,
                          521,
                          606
                      ],
                      "content": "vieuos love of detouils"
                  }
              ]
          },
          {
              "pageNumber": 2,
              "image": "assets/pages/scanned_p2.png",
              "aspectRatio": 0.751,
              "blocks": [
                  {
                      "id": "p2-b1",
                      "category": "title",
                      "bbox": [
                          50,
                          17,
                          271,
                          48
                      ],
                      "content": "2.] INCLUDE:"
                  },
                  {
                      "id": "p2-b2",
                      "category": "title",
                      "bbox": [
                          114,
                          72,
                          236,
                          101
                      ],
                      "content": "Region"
                  },
                  {
                      "id": "p2-b3",
                      "category": "title",
                      "bbox": [
                          364,
                          71,
                          506,
                          91
                      ],
                      "content": "customer"
                  },
                  {
                      "id": "p2-b4",
                      "category": "title",
                      "bbox": [
                          389,
                          93,
                          483,
                          117
                      ],
                      "content": "Zamo"
                  },
                  {
                      "id": "p2-b5",
                      "category": "title",
                      "bbox": [
                          102,
                          140,
                          214,
                          162
                      ],
                      "content": "Centrol"
                  },
                  {
                      "id": "p2-b6",
                      "category": "title",
                      "bbox": [
                          356,
                          138,
                          453,
                          166
                      ],
                      "content": "Amon"
                  },
                  {
                      "id": "p2-b7",
                      "category": "title",
                      "bbox": [
                          352,
                          173,
                          477,
                          205
                      ],
                      "content": "Adonan"
                  },
                  {
                      "id": "p2-b8",
                      "category": "title",
                      "bbox": [
                          354,
                          214,
                          436,
                          240
                      ],
                      "content": "Alon"
                  },
                  {
                      "id": "p2-b9",
                      "category": "title",
                      "bbox": [
                          355,
                          244,
                          517,
                          276
                      ],
                      "content": "Alenjandra"
                  },
                  {
                      "id": "p2-b10",
                      "category": "title",
                      "bbox": [
                          358,
                          289,
                          439,
                          314
                      ],
                      "content": "Aice"
                  },
                  {
                      "id": "p2-b11",
                      "category": "title",
                      "bbox": [
                          84,
                          370,
                          169,
                          394
                      ],
                      "content": "usi ng"
                  },
                  {
                      "id": "p2-b12",
                      "category": "title",
                      "bbox": [
                          262,
                          367,
                          398,
                          388
                      ],
                      "content": "HNCIUD"
                  },
                  {
                      "id": "p2-b13",
                      "category": "text",
                      "bbox": [
                          235,
                          374,
                          981,
                          430
                      ],
                      "content": "FxoDacwaho，othcustomes"
                  },
                  {
                      "id": "p2-b14",
                      "category": "title",
                      "bbox": [
                          197,
                          384,
                          210,
                          393
                      ],
                      "content": "C"
                  },
                  {
                      "id": "p2-b15",
                      "category": "title",
                      "bbox": [
                          72,
                          404,
                          239,
                          434
                      ],
                      "content": ": Compared"
                  },
                  {
                      "id": "p2-b16",
                      "category": "title",
                      "bbox": [
                          320,
                          411,
                          674,
                          451
                      ],
                      "content": "HheirSaeoOmunt"
                  },
                  {
                      "id": "p2-b17",
                      "category": "title",
                      "bbox": [
                          78,
                          468,
                          267,
                          510
                      ],
                      "content": "EXCLUDE:"
                  },
                  {
                      "id": "p2-b18",
                      "category": "title",
                      "bbox": [
                          98,
                          532,
                          243,
                          584
                      ],
                      "content": "Reobao"
                  },
                  {
                      "id": "p2-b19",
                      "category": "title",
                      "bbox": [
                          347,
                          557,
                          570,
                          592
                      ],
                      "content": "Sub cateqon"
                  },
                  {
                      "id": "p2-b20",
                      "category": "title",
                      "bbox": [
                          326,
                          606,
                          493,
                          639
                      ],
                      "content": "Bookcooes"
                  },
                  {
                      "id": "p2-b21",
                      "category": "title",
                      "bbox": [
                          105,
                          626,
                          253,
                          656
                      ],
                      "content": "Fuuniture"
                  },
                  {
                      "id": "p2-b22",
                      "category": "title",
                      "bbox": [
                          614,
                          622,
                          740,
                          654
                      ],
                      "content": "11,S,361"
                  },
                  {
                      "id": "p2-b23",
                      "category": "title",
                      "bbox": [
                          333,
                          632,
                          435,
                          667
                      ],
                      "content": "chair"
                  },
                  {
                      "id": "p2-b24",
                      "category": "title",
                      "bbox": [
                          609,
                          653,
                          743,
                          688
                      ],
                      "content": "85L'5EE"
                  },
                  {
                      "id": "p2-b25",
                      "category": "title",
                      "bbox": [
                          325,
                          663,
                          454,
                          694
                      ],
                      "content": "Tablo"
                  },
                  {
                      "id": "p2-b26",
                      "category": "title",
                      "bbox": [
                          610,
                          684,
                          749,
                          717
                      ],
                      "content": "2b.0po"
                  },
                  {
                      "id": "p2-b27",
                      "category": "title",
                      "bbox": [
                          123,
                          691,
                          233,
                          722
                      ],
                      "content": "o"
                  },
                  {
                      "id": "p2-b28",
                      "category": "title",
                      "bbox": [
                          340,
                          703,
                          421,
                          731
                      ],
                      "content": "Asts"
                  },
                  {
                      "id": "p2-b29",
                      "category": "title",
                      "bbox": [
                          607,
                          718,
                          735,
                          749
                      ],
                      "content": "27,659"
                  },
                  {
                      "id": "p2-b30",
                      "category": "title",
                      "bbox": [
                          117,
                          725,
                          257,
                          758
                      ],
                      "content": "86039"
                  },
                  {
                      "id": "p2-b31",
                      "category": "title",
                      "bbox": [
                          346,
                          731,
                          504,
                          765
                      ],
                      "content": "Bindeas"
                  },
                  {
                      "id": "p2-b32",
                      "category": "title",
                      "bbox": [
                          366,
                          759,
                          463,
                          784
                      ],
                      "content": "popS"
                  },
                  {
                      "id": "p2-b33",
                      "category": "title",
                      "bbox": [
                          110,
                          770,
                          279,
                          836
                      ],
                      "content": "Rbaauya"
                  },
                  {
                      "id": "p2-b34",
                      "category": "title",
                      "bbox": [
                          616,
                          776,
                          733,
                          809
                      ],
                      "content": "74541"
                  },
                  {
                      "id": "p2-b35",
                      "category": "title",
                      "bbox": [
                          356,
                          787,
                          491,
                          822
                      ],
                      "content": "Copiers'"
                  },
                  {
                      "id": "p2-b36",
                      "category": "title",
                      "bbox": [
                          612,
                          811,
                          745,
                          848
                      ],
                      "content": "156,745"
                  },
                  {
                      "id": "p2-b37",
                      "category": "title",
                      "bbox": [
                          355,
                          821,
                          473,
                          853
                      ],
                      "content": "phono"
                  },
                  {
                      "id": "p2-b38",
                      "category": "title",
                      "bbox": [
                          49,
                          854,
                          178,
                          883
                      ],
                      "content": "·show"
                  },
                  {
                      "id": "p2-b39",
                      "category": "title",
                      "bbox": [
                          608,
                          850,
                          751,
                          889
                      ],
                      "content": "331,843"
                  },
                  {
                      "id": "p2-b40",
                      "category": "title",
                      "bbox": [
                          203,
                          864,
                          290,
                          893
                      ],
                      "content": "each"
                  },
                  {
                      "id": "p2-b41",
                      "category": "title",
                      "bbox": [
                          307,
                          875,
                          546,
                          922
                      ],
                      "content": "swb-cateqoy"
                  },
                  {
                      "id": "p2-b42",
                      "category": "title",
                      "bbox": [
                          67,
                          887,
                          286,
                          944
                      ],
                      "content": "R"
                  },
                  {
                      "id": "p2-b43",
                      "category": "text",
                      "bbox": [
                          588,
                          903,
                          999,
                          961
                      ],
                      "content": "Saleocohileexcludin"
                  },
                  {
                      "id": "p2-b44",
                      "category": "title",
                      "bbox": [
                          309,
                          910,
                          644,
                          982
                      ],
                      "content": "Robaeoduo"
                  },
                  {
                      "id": "p2-b45",
                      "category": "title",
                      "bbox": [
                          88,
                          936,
                          193,
                          969
                      ],
                      "content": "Scleo."
                  },
                  {
                      "id": "p2-b46",
                      "category": "title",
                      "bbox": [
                          660,
                          955,
                          729,
                          979
                      ],
                      "content": "Cos"
                  },
                  {
                      "id": "p2-b47",
                      "category": "title",
                      "bbox": [
                          755,
                          960,
                          960,
                          998
                      ],
                      "content": "Sub.catea"
                  }
              ]
          }
      ]
  }
};

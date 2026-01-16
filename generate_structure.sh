#!/bin/bash

# Create frontend structure
mkdir -p frontend/{public/assets,src/{components/{ui,tasks,capacity,layout},pages,features/{tasks/{hooks,api},capacity/{hooks,api},auth/{hooks,api}},lib,hooks,stores,styles,types}}

# Create backend structure
mkdir -p backend/{src/{config,routes,controllers,services,models,middleware,utils,types},prisma/migrations}

# Create ai-engine structure
mkdir -p ai-engine/{src/{api,services,models,prompts,data,database,integrations,utils},tests,notebooks,data/{benchmarks,samples}}

# Create other directories
mkdir -p docs database/{migrations,seeds,backups} scripts tests/{e2e,integration} .github/workflows infrastructure/{terraform,kubernetes}

# Create empty files (frontend)
touch frontend/{package.json,tsconfig.json,vite.config.ts,tailwind.config.js,index.html}
touch frontend/public/favicon.ico
touch frontend/src/{main.tsx,App.tsx}
touch frontend/src/components/ui/{Button.tsx,Input.tsx,Card.tsx,Alert.tsx,Modal.tsx}
touch frontend/src/components/tasks/{TaskCard.tsx,TaskInput.tsx,TaskBreakdown.tsx,TimeEstimate.tsx,SubtaskList.tsx}
touch frontend/src/components/capacity/{CapacityGauge.tsx,OvercommitmentAlert.tsx,WeeklyCapacityGrid.tsx}
touch frontend/src/components/layout/{Header.tsx,Sidebar.tsx,MainLayout.tsx}
touch frontend/src/pages/{Dashboard.tsx,TaskDetail.tsx,WeeklyPlanner.tsx,Reflection.tsx,Settings.tsx,Onboarding.tsx,Login.tsx}
touch frontend/src/features/tasks/hooks/{useTasks.ts,useTaskBreakdown.ts,useTimeEstimate.ts}
touch frontend/src/features/tasks/api/tasksApi.ts
touch frontend/src/features/tasks/types.ts
touch frontend/src/features/capacity/hooks/{useCapacity.ts,useOvercommitment.ts}
touch frontend/src/features/capacity/api/capacityApi.ts
touch frontend/src/features/capacity/types.ts
touch frontend/src/features/auth/hooks/useAuth.ts
touch frontend/src/features/auth/api/authApi.ts
touch frontend/src/features/auth/types.ts
touch frontend/src/lib/{api.ts,utils.ts,constants.ts,validators.ts}
touch frontend/src/hooks/{useLocalStorage.ts,useDebounce.ts}
touch frontend/src/stores/{taskStore.ts,userStore.ts,capacityStore.ts}
touch frontend/src/styles/{globals.css,variables.css}
touch frontend/src/types/{task.ts,user.ts,capacity.ts,api.ts}

# Create empty files (backend)
touch backend/{package.json,tsconfig.json}
touch backend/src/{index.ts,app.ts}
touch backend/src/config/{database.ts,auth.ts,env.ts}
touch backend/src/routes/{index.ts,tasks.routes.ts,predictions.routes.ts,capacity.routes.ts,users.routes.ts,auth.routes.ts,integrations.routes.ts}
touch backend/src/controllers/{tasks.controller.ts,predictions.controller.ts,capacity.controller.ts,users.controller.ts,auth.controller.ts}
touch backend/src/services/{task.service.ts,prediction.service.ts,capacity.service.ts,user.service.ts,calendar.service.ts,notification.service.ts}
touch backend/src/models/schema.prisma
touch backend/src/middleware/{auth.middleware.ts,validation.middleware.ts,error.middleware.ts,rateLimit.middleware.ts}
touch backend/src/utils/{logger.ts,errors.ts,validators.ts}
touch backend/src/types/{express.d.ts,api.ts}
touch backend/prisma/seed.ts

# Create empty files (ai-engine)
touch ai-engine/{requirements.txt,setup.py,.env.example}
touch ai-engine/src/{__init__.py,main.py}
touch ai-engine/src/api/{__init__.py,tasks.py,predictions.py,recommendations.py}
touch ai-engine/src/services/{__init__.py,task_analyzer.py,time_predictor.py,learning_engine.py,recommendation_engine.py,pattern_detector.py}
touch ai-engine/src/models/{__init__.py,base_predictor.py,calibration.py,classifier.py,confidence_scorer.py}
touch ai-engine/src/prompts/{task_breakdown.py,classification.py,recommendations.py,insights.py}
touch ai-engine/src/data/{__init__.py,preprocessor.py,feature_extractor.py,benchmark_data.py}
touch ai-engine/src/database/{__init__.py,models.py,repository.py}
touch ai-engine/src/integrations/{__init__.py,claude_api.py}
touch ai-engine/src/utils/{__init__.py,logger.py,validators.py,metrics.py}
touch ai-engine/tests/{test_task_analyzer.py,test_time_predictor.py,test_learning_engine.py,test_recommendations.py}
touch ai-engine/notebooks/{data_exploration.ipynb,model_evaluation.ipynb,pattern_analysis.ipynb}

# Create root files
touch {README.md,.gitignore,.env.example,docker-compose.yml,package.json}

# Create docs
touch docs/{PRD.md,API.md,ARCHITECTURE.md,DATABASE_SCHEMA.md,DEPLOYMENT.md,TEAM_ROLES.md}

# Create scripts
touch scripts/{setup.sh,deploy.sh,seed-db.sh,run-tests.sh}

# Create tests
touch tests/e2e/{user-flow.spec.ts,task-creation.spec.ts,capacity-alerts.spec.ts}
touch tests/integration/{tasks.test.ts,predictions.test.ts,capacity.test.ts}

# Create GitHub workflows
touch .github/workflows/{ci.yml,deploy.yml,tests.yml}

echo "✅ Folder structure created successfully!"
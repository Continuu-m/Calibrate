#CLI entry 
"""Task Manager CLI."""
import os
import argparse
from tasks import AgentTasks
from tasks import (  # All your functions
    add_task, view_tasks, remove_task, save_tasks, load_tasks, mark_complete,
    detect_subtasks, calculate_capacity, detect_overcommitment
)

TASKS_FILE = "data/tasks.json"  # Fixed path

def print_menu():
    print("\n" + "="*30)
    print("     AI-Engine Task Manager")
    print("="*30)
    print("1. Add Task")
    print("2. View Tasks") 
    print("3. Mark Complete")
    print("4. Remove Task")
    print("5. Save & Exit")
    print("6. AI Analyze")
    print("7. Capacity Check")

def main():
    tasks = load_tasks(TASKS_FILE)
    
    while True:
        print_menu()
        choice = input("Choose (1-7): ").strip()
        
        if choice == "1":
            desc = input("Task description: ").strip()
            if desc:
                add_task(tasks, desc)
                print(f"Added: {desc}")
        
        elif choice == "2":
            view_tasks(tasks)
        
        elif choice == "3":
            view_tasks(tasks)
            try:
                idx = int(input("Task number: ")) - 1
                if mark_complete(tasks, idx):
                    print("Marked complete!")
                else:
                    print("Invalid number.")
            except ValueError:
                print("Enter number.")
        
        elif choice == "4":
            view_tasks(tasks)
            try:
                idx = int(input("Task number: ")) - 1
                removed = remove_task(tasks, idx)
                if removed:
                    print(f"Removed: {removed['description']}")
            except ValueError:
                print("Enter number.")
        
        elif choice == "5":
            save_tasks(TASKS_FILE, tasks)
            print("Saved. Goodbye!")
            break
        
        elif choice == "6":
            task = input("Task to analyze: ")
            subtasks = detect_subtasks(task)
            print("AI Subtasks:")
            for st in subtasks:
                print(f"{st.id}. [{st.type}] {st.description}")
                add_task(tasks, f"[{st.type}] {st.description}")
        
        elif choice == "7":
            print(f"Today's capacity: {calculate_capacity(tasks)}h")
            overcommit = detect_overcommitment(tasks)
            if overcommit:
                print("⚠️ OVERCOMMIT:")
                print(f"Excess: {overcommit['excess']:.1f}h")
                for rec in overcommit['recommendations']:
                    print(f"  • {rec}")
            else:
                print("✅ Good capacity!")
        
        else:
            print("Invalid choice!")
    parser = argparse.ArgumentParser(description="LLM Agent CLI")
    parser.add_argument("task", choices=["calibrate", "capacity_check", "breakdown"])
    parser.add_argument("--model", default="gpt-4o")
    parser.add_argument("--input", required=True)
    args = parser.parse_args()

    agent = AgentTasks()
    if args.task == "calibrate":
        result = agent.calibrate(args.model, [{"input": args.input}])
    elif args.task == "capacity_check":
        result = agent.capacity_check(args.input, 500)
    else:
        result = agent.breakdown(args.input)
        
    print("Result:")

if __name__ == "__main__":
    main()

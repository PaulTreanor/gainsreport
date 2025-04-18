# Workout log file schema 
Workouts are tracked in a markdown file where each workout follows a schema similar to this:

```EBNF
## <DATE> 

- <EXERCISE NAME>: <SET_SPEC> {, <SET_SPEC>}* [ #<TAG>{, <TAG>}* ] [ > <NOTE> ]

where:

• <DATE>       = ISO‑8601 date, e.g. 2025‑04‑17  
• <EXERCISE NAME> = any text not containing “:” (e.g. “Squat”, “Split Squats (BW)”)  

• <SET_SPEC>   = <SETS> “x” <REPS> [ “@” <WEIGHT> ]  
    – <SETS>    = integer  
    – <REPS>    = integer | “Failure”  
    – <WEIGHT>  = number + unit (e.g. “100kg”, “225lb”, or “BW”)  

• <TAG>        = alpha‑numeric token (e.g. “PR”, “upper”, “deload”)  
• <NOTE>       = free text  

```

Examples of workouts

```
## 2025-02-12
- DB RDL: 3x10 @15kg
- Pushups: 3x10, 1x25 @BW
- DB Curls: 3x18 @7.5kg

## 2025-02-15
- Squats: 4x5 @80kg
- DB RDL: 3x10 @22.5kg
- Hack Squats: 2x10 @20kg

## 2025-02-24
- Pushups: 4x12 @BW
- DB Row: 4x12 @12.5kg
- DB OHP: 2x10 @12.5kg
```

At the top of the log file there's a goals section, the application should treat this separately to workouts. 

```md
# Goals
- [x] 2025-03-14: Do 25 pushups
- [ ] 2025-05-28: Have noticeably bigger arms
```

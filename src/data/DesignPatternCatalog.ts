import type { DesignPatternPreset } from "@/types/uml";

export const designPatternCatalog: DesignPatternPreset[] = [
  {
    id: "singleton",
    name: "Singleton",
    category: "Creational",
    description: "Ensures a class has only one instance and provides a global point of access to it. Perfect for managing shared resources like Database Connections, Logging Services, or Thread Pools.",
    solidPrinciples: [
      {
        principle: "Single Responsibility Principle (SRP)",
        explanation: "The class is solely responsible for managing its own unique lifetime and single instance, separate from its actual business operations (e.g. executing queries)."
      },
      {
        principle: "Open-Closed Principle (OCP)",
        explanation: "Extending a Singleton can be challenging, but it can be refactored into an interface and implemented by subclasses if required, ensuring client code is closed for modification."
      }
    ],
    nodes: [
      {
        id: "singleton-db",
        type: "umlClass",
        label: "DatabaseConnection",
        description: "Manages a unique connection instance.",
        color: "#6366f1",
        position: { x: 100, y: 100 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "s-a1", name: "instance", type: "DatabaseConnection", visibility: "private" },
            { id: "s-a2", name: "connectionString", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "s-m1", name: "DatabaseConnection", returnType: "void", parameters: [], visibility: "private" },
            { id: "s-m2", name: "getInstance", returnType: "DatabaseConnection", parameters: [], visibility: "public" },
            { id: "s-m3", name: "executeQuery", returnType: "ResultSet", parameters: [{ name: "query", type: "string" }], visibility: "public" }
          ]
        }
      }
    ],
    edges: []
  },
  {
    id: "factory",
    name: "Factory Method",
    category: "Creational",
    description: "Defines an interface for creating an object, but lets subclasses decide which class to instantiate. Decouples the client code from the concrete classes it instantiates.",
    solidPrinciples: [
      {
        principle: "Single Responsibility Principle (SRP)",
        explanation: "Moves the product creation code into one single location (the Factory class), making the code easier to maintain and support."
      },
      {
        principle: "Open-Closed Principle (OCP)",
        explanation: "Allows introducing new types of products into the system without breaking existing client code. You just add a new subclass and extend the factory."
      }
    ],
    nodes: [
      {
        id: "factory-prod-int",
        type: "umlClass",
        label: "Notification",
        description: "Product interface for notification types.",
        color: "#10b981",
        position: { x: 300, y: 50 },
        config: {
          isInterface: true,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "f-m1", name: "send", returnType: "void", parameters: [{ name: "message", type: "string" }], visibility: "public" }
          ]
        }
      },
      {
        id: "factory-prod-a",
        type: "umlClass",
        label: "EmailNotification",
        description: "Concrete Product for Emails.",
        color: "#34d399",
        position: { x: 150, y: 220 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "f-a1", name: "emailAddress", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "f-m2", name: "send", returnType: "void", parameters: [{ name: "message", type: "string" }], visibility: "public" }
          ]
        }
      },
      {
        id: "factory-prod-b",
        type: "umlClass",
        label: "SMSNotification",
        description: "Concrete Product for SMS Texting.",
        color: "#34d399",
        position: { x: 450, y: 220 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "f-a2", name: "phoneNumber", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "f-m3", name: "send", returnType: "void", parameters: [{ name: "message", type: "string" }], visibility: "public" }
          ]
        }
      },
      {
        id: "factory-creator",
        type: "umlClass",
        label: "NotificationFactory",
        description: "Creator class returning dynamic notifications.",
        color: "#60a5fa",
        position: { x: 300, y: 380 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "f-m4", name: "createNotification", returnType: "Notification", parameters: [{ name: "type", type: "string" }], visibility: "public" }
          ]
        }
      }
    ],
    edges: [
      {
        id: "f-e1",
        source: "factory-prod-a",
        target: "factory-prod-int",
        sourceHandle: "top-source",
        targetHandle: "left-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "f-e2",
        source: "factory-prod-b",
        target: "factory-prod-int",
        sourceHandle: "top-source",
        targetHandle: "right-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "f-e3",
        source: "factory-creator",
        target: "factory-prod-int",
        sourceHandle: "top-source",
        targetHandle: "bottom-target",
        type: "umlEdge",
        data: { relationship: "dependency", label: "creates" }
      }
    ]
  },
  {
    id: "strategy",
    name: "Strategy",
    category: "Behavioral",
    description: "Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.",
    solidPrinciples: [
      {
        principle: "Open-Closed Principle (OCP)",
        explanation: "You can introduce new strategies (algorithms) without changing the context class. Context remains closed for modification and open for extensions."
      },
      {
        principle: "Dependency Inversion Principle (DIP)",
        explanation: "The ShoppingCart Context depends on the PaymentStrategy abstraction rather than depending on CreditCardPayment or PayPalPayment directly."
      }
    ],
    nodes: [
      {
        id: "strat-context",
        type: "umlClass",
        label: "ShoppingCart",
        description: "The Context class that delegates actions.",
        color: "#f59e0b",
        position: { x: 100, y: 150 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "st-a1", name: "strategy", type: "PaymentStrategy", visibility: "private" },
            { id: "st-a2", name: "totalAmount", type: "number", visibility: "private" }
          ],
          methods: [
            { id: "st-m1", name: "setPaymentStrategy", returnType: "void", parameters: [{ name: "strategy", type: "PaymentStrategy" }], visibility: "public" },
            { id: "st-m2", name: "checkout", returnType: "void", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "strat-interface",
        type: "umlClass",
        label: "PaymentStrategy",
        description: "The Strategy interface for interchangeable logic.",
        color: "#ef4444",
        position: { x: 450, y: 150 },
        config: {
          isInterface: true,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "st-m3", name: "pay", returnType: "void", parameters: [{ name: "amount", type: "number" }], visibility: "public" }
          ]
        }
      },
      {
        id: "strat-concrete-a",
        type: "umlClass",
        label: "CreditCardPayment",
        description: "Concrete Strategy representing card processor.",
        color: "#f87171",
        position: { x: 300, y: 320 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "st-a3", name: "cardNumber", type: "string", visibility: "private" },
            { id: "st-a4", name: "cvv", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "st-m4", name: "pay", returnType: "void", parameters: [{ name: "amount", type: "number" }], visibility: "public" }
          ]
        }
      },
      {
        id: "strat-concrete-b",
        type: "umlClass",
        label: "PayPalPayment",
        description: "Concrete Strategy representing web wallets.",
        color: "#f87171",
        position: { x: 580, y: 320 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "st-a5", name: "emailId", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "st-m5", name: "pay", returnType: "void", parameters: [{ name: "amount", type: "number" }], visibility: "public" }
          ]
        }
      }
    ],
    edges: [
      {
        id: "st-e1",
        source: "strat-context",
        target: "strat-interface",
        sourceHandle: "right-source",
        targetHandle: "left-target",
        type: "umlEdge",
        data: { relationship: "aggregation", label: "uses" }
      },
      {
        id: "st-e2",
        source: "strat-concrete-a",
        target: "strat-interface",
        sourceHandle: "top-source",
        targetHandle: "bottom-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "st-e3",
        source: "strat-concrete-b",
        target: "strat-interface",
        sourceHandle: "top-source",
        targetHandle: "right-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      }
    ]
  },
  {
    id: "observer",
    name: "Observer",
    category: "Behavioral",
    description: "Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.",
    solidPrinciples: [
      {
        principle: "Open-Closed Principle (OCP)",
        explanation: "You can introduce new Observer classes without changing the Subject. The system is open to new subscribers and closed for modification."
      },
      {
        principle: "Dependency Inversion Principle (DIP)",
        explanation: "The Subject depends on the generic Observer abstraction rather than coupling to specific visual subscriber components."
      }
    ],
    nodes: [
      {
        id: "obs-subj",
        type: "umlClass",
        label: "NewsletterPublisher",
        description: "The Subject that tracks active subscriptions.",
        color: "#a855f7",
        position: { x: 100, y: 150 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "ob-a1", name: "observers", type: "List<Observer>", visibility: "private" },
            { id: "ob-a2", name: "latestArticle", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "ob-m1", name: "subscribe", returnType: "void", parameters: [{ name: "observer", type: "Observer" }], visibility: "public" },
            { id: "ob-m2", name: "unsubscribe", returnType: "void", parameters: [{ name: "observer", type: "Observer" }], visibility: "public" },
            { id: "ob-m3", name: "notifyAll", returnType: "void", parameters: [], visibility: "public" },
            { id: "ob-m4", name: "publish", returnType: "void", parameters: [{ name: "article", type: "string" }], visibility: "public" }
          ]
        }
      },
      {
        id: "obs-interface",
        type: "umlClass",
        label: "Observer",
        description: "The generic subscriber interface.",
        color: "#ec4899",
        position: { x: 450, y: 150 },
        config: {
          isInterface: true,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "ob-m5", name: "update", returnType: "void", parameters: [{ name: "article", type: "string" }], visibility: "public" }
          ]
        }
      },
      {
        id: "obs-concrete-a",
        type: "umlClass",
        label: "UserDashboard",
        description: "A concrete subscriber displaying incoming news.",
        color: "#f472b6",
        position: { x: 450, y: 320 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "ob-a3", name: "dashboardTitle", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "ob-m6", name: "update", returnType: "void", parameters: [{ name: "article", type: "string" }], visibility: "public" }
          ]
        }
      }
    ],
    edges: [
      {
        id: "ob-e1",
        source: "obs-subj",
        target: "obs-interface",
        sourceHandle: "right-source",
        targetHandle: "left-target",
        type: "umlEdge",
        data: { relationship: "composition", label: "notifies" }
      },
      {
        id: "ob-e2",
        source: "obs-concrete-a",
        target: "obs-interface",
        sourceHandle: "top-source",
        targetHandle: "bottom-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      }
    ]
  },
  {
    id: "decorator",
    name: "Decorator",
    category: "Structural",
    description: "Attaches additional responsibilities to an object dynamically. Provides a flexible alternative to subclassing for extending functionality.",
    solidPrinciples: [
      {
        principle: "Open-Closed Principle (OCP)",
        explanation: "You can extend an object's behavior by creating new Decorators without modifying the original Component class."
      },
      {
        principle: "Single Responsibility Principle (SRP)",
        explanation: "Divides complex monolithic behaviors into smaller, specialized Decorator wrapper classes."
      }
    ],
    nodes: [
      {
        id: "dec-int",
        type: "umlClass",
        label: "Coffee",
        description: "Component interface for beverage items.",
        color: "#06b6d4",
        position: { x: 300, y: 50 },
        config: {
          isInterface: true,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "dec-m1", name: "getCost", returnType: "number", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "dec-comp",
        type: "umlClass",
        label: "SimpleCoffee",
        description: "Concrete Component offering basic coffee.",
        color: "#22d3ee",
        position: { x: 100, y: 220 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "dec-a1", name: "basePrice", type: "number", visibility: "private" }
          ],
          methods: [
            { id: "dec-m2", name: "getCost", returnType: "number", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "dec-base",
        type: "umlClass",
        label: "CoffeeDecorator",
        description: "Abstract Decorator wrapping a Coffee instance.",
        color: "#38bdf8",
        position: { x: 500, y: 220 },
        config: {
          isInterface: false,
          isAbstract: true,
          attributes: [
            { id: "dec-a2", name: "decoratedCoffee", type: "Coffee", visibility: "protected" }
          ],
          methods: [
            { id: "dec-m3", name: "getCost", returnType: "number", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "dec-milk",
        type: "umlClass",
        label: "MilkDecorator",
        description: "Concrete Decorator adding milk cost.",
        color: "#0284c7",
        position: { x: 500, y: 390 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "dec-a3", name: "milkPrice", type: "number", visibility: "private" }
          ],
          methods: [
            { id: "dec-m4", name: "getCost", returnType: "number", parameters: [], visibility: "public" }
          ]
        }
      }
    ],
    edges: [
      {
        id: "dec-e1",
        source: "dec-comp",
        target: "dec-int",
        sourceHandle: "top-source",
        targetHandle: "bottom-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "dec-e2",
        source: "dec-base",
        target: "dec-int",
        sourceHandle: "top-source",
        targetHandle: "right-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "dec-e3",
        source: "dec-base",
        target: "dec-int",
        sourceHandle: "left-source",
        targetHandle: "top-target",
        type: "umlEdge",
        data: { relationship: "aggregation", label: "wraps" }
      },
      {
        id: "dec-e4",
        source: "dec-milk",
        target: "dec-base",
        sourceHandle: "top-source",
        targetHandle: "bottom-target",
        type: "umlEdge",
        data: { relationship: "inheritance" }
      }
    ]
  },
  {
    id: "command",
    name: "Command",
    category: "Behavioral",
    description: "Encapsulates a request as an object, parameterizing clients with different requests, queueing operations, and supporting undoable actions.",
    solidPrinciples: [
      {
        principle: "Single Responsibility Principle (SRP)",
        explanation: "Decouples the invoker class (RemoteControl) that triggers operations from the receiver class (Light) that performs the actual logic."
      },
      {
        principle: "Open-Closed Principle (OCP)",
        explanation: "You can introduce new Command classes into the system without breaking existing Invoker or Receiver code."
      }
    ],
    nodes: [
      {
        id: "cmd-int",
        type: "umlClass",
        label: "Command",
        description: "Interface for executing operations.",
        color: "#eab308",
        position: { x: 320, y: 50 },
        config: {
          isInterface: true,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "cmd-m1", name: "execute", returnType: "void", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "cmd-concrete",
        type: "umlClass",
        label: "LightOnCommand",
        description: "Concrete Command linking to Receiver.",
        color: "#facc15",
        position: { x: 320, y: 220 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "cmd-a1", name: "light", type: "Light", visibility: "private" }
          ],
          methods: [
            { id: "cmd-m2", name: "execute", returnType: "void", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "cmd-receiver",
        type: "umlClass",
        label: "Light",
        description: "Receiver class containing business execution.",
        color: "#fbbf24",
        position: { x: 580, y: 220 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "cmd-a2", name: "location", type: "string", visibility: "private" }
          ],
          methods: [
            { id: "cmd-m3", name: "turnOn", returnType: "void", parameters: [], visibility: "public" },
            { id: "cmd-m4", name: "turnOff", returnType: "void", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "cmd-invoker",
        type: "umlClass",
        label: "RemoteControl",
        description: "Invoker class triggering commands.",
        color: "#ca8a04",
        position: { x: 60, y: 220 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "cmd-a3", name: "command", type: "Command", visibility: "private" }
          ],
          methods: [
            { id: "cmd-m5", name: "setCommand", returnType: "void", parameters: [{ name: "cmd", type: "Command" }], visibility: "public" },
            { id: "cmd-m6", name: "pressButton", returnType: "void", parameters: [], visibility: "public" }
          ]
        }
      }
    ],
    edges: [
      {
        id: "cmd-e1",
        source: "cmd-concrete",
        target: "cmd-int",
        sourceHandle: "top-source",
        targetHandle: "bottom-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "cmd-e2",
        source: "cmd-concrete",
        target: "cmd-receiver",
        sourceHandle: "right-source",
        targetHandle: "left-target",
        type: "umlEdge",
        data: { relationship: "association", label: "delegates" }
      },
      {
        id: "cmd-e3",
        source: "cmd-invoker",
        target: "cmd-int",
        sourceHandle: "top-source",
        targetHandle: "left-target",
        type: "umlEdge",
        data: { relationship: "aggregation", label: "holds" }
      }
    ]
  },
  {
    id: "adapter",
    name: "Adapter",
    category: "Structural",
    description: "Converts the interface of a class into another interface that clients expect, enabling incompatible interfaces to work together.",
    solidPrinciples: [
      {
        principle: "Single Responsibility Principle (SRP)",
        explanation: "Separates the interface conversion logic from the core business logic of the client or adaptee classes."
      },
      {
        principle: "Open-Closed Principle (OCP)",
        explanation: "Allows introducing new Adapters to support new legacy interfaces without altering client code."
      }
    ],
    nodes: [
      {
        id: "adp-target",
        type: "umlClass",
        label: "Printer3D",
        description: "Target interface expected by modern clients.",
        color: "#8b5cf6",
        position: { x: 100, y: 120 },
        config: {
          isInterface: true,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "adp-m1", name: "print3D", returnType: "void", parameters: [{ name: "model", type: "string" }], visibility: "public" }
          ]
        }
      },
      {
        id: "adp-class",
        type: "umlClass",
        label: "PrinterAdapter",
        description: "Adapter converting modern calls to legacy format.",
        color: "#a855f7",
        position: { x: 400, y: 120 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "adp-a1", name: "legacyPrinter", type: "LegacyPrinter", visibility: "private" }
          ],
          methods: [
            { id: "adp-m2", name: "print3D", returnType: "void", parameters: [{ name: "model", type: "string" }], visibility: "public" }
          ]
        }
      },
      {
        id: "adp-adaptee",
        type: "umlClass",
        label: "LegacyPrinter",
        description: "Incompatible legacy class (Adaptee).",
        color: "#c084fc",
        position: { x: 400, y: 300 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "adp-m3", name: "printOldFormat", returnType: "void", parameters: [{ name: "text", type: "string" }], visibility: "public" }
          ]
        }
      }
    ],
    edges: [
      {
        id: "adp-e1",
        source: "adp-class",
        target: "adp-target",
        sourceHandle: "left-source",
        targetHandle: "right-target",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "adp-e2",
        source: "adp-class",
        target: "adp-adaptee",
        sourceHandle: "bottom-source",
        targetHandle: "top-target",
        type: "umlEdge",
        data: { relationship: "composition", label: "wraps" }
      }
    ]
  },
  {
    id: "facade",
    name: "Facade",
    category: "Structural",
    description: "Provides a unified, simplified interface to a complex subsystem of classes, making a framework or library easy to use.",
    solidPrinciples: [
      {
        principle: "Single Responsibility Principle (SRP)",
        explanation: "Shields client systems from managing multiple subsystem components directly by consolidating entry logic."
      },
      {
        principle: "Dependency Inversion Principle (DIP)",
        explanation: "Clients depend on the high-level Facade abstraction rather than directly coupling to low-level subsystem implementation details."
      }
    ],
    nodes: [
      {
        id: "fac-entry",
        type: "umlClass",
        label: "HomeTheaterFacade",
        description: "Simplified entry point for home theater subsystem.",
        color: "#ec4899",
        position: { x: 300, y: 50 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "fac-a1", name: "projector", type: "Projector", visibility: "private" },
            { id: "fac-a2", name: "sound", type: "SoundSystem", visibility: "private" }
          ],
          methods: [
            { id: "fac-m1", name: "watchMovie", returnType: "void", parameters: [], visibility: "public" },
            { id: "fac-m2", name: "endMovie", returnType: "void", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "fac-sub1",
        type: "umlClass",
        label: "Projector",
        description: "Subsystem component for video display.",
        color: "#f472b6",
        position: { x: 100, y: 240 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [],
          methods: [
            { id: "fac-m3", name: "on", returnType: "void", parameters: [], visibility: "public" },
            { id: "fac-m4", name: "wideScreenMode", returnType: "void", parameters: [], visibility: "public" }
          ]
        }
      },
      {
        id: "fac-sub2",
        type: "umlClass",
        label: "SoundSystem",
        description: "Subsystem component for audio playback.",
        color: "#f472b6",
        position: { x: 500, y: 240 },
        config: {
          isInterface: false,
          isAbstract: false,
          attributes: [
            { id: "fac-a3", name: "volume", type: "number", visibility: "private" }
          ],
          methods: [
            { id: "fac-m5", name: "on", returnType: "void", parameters: [], visibility: "public" },
            { id: "fac-m6", name: "setVolume", returnType: "void", parameters: [{ name: "vol", type: "number" }], visibility: "public" }
          ]
        }
      }
    ],
    edges: [
      {
        id: "fac-e1",
        source: "fac-entry",
        target: "fac-sub1",
        sourceHandle: "left-source",
        targetHandle: "top-target",
        type: "umlEdge",
        data: { relationship: "composition", label: "controls" }
      },
      {
        id: "fac-e2",
        source: "fac-entry",
        target: "fac-sub2",
        sourceHandle: "right-source",
        targetHandle: "top-target",
        type: "umlEdge",
        data: { relationship: "composition", label: "controls" }
      }
    ]
  }
];

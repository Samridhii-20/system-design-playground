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
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "f-e2",
        source: "factory-prod-b",
        target: "factory-prod-int",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "f-e3",
        source: "factory-creator",
        target: "factory-prod-int",
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
        position: { x: 420, y: 150 },
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
        position: { x: 550, y: 320 },
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
        type: "umlEdge",
        data: { relationship: "aggregation", label: "uses" }
      },
      {
        id: "st-e2",
        source: "strat-concrete-a",
        target: "strat-interface",
        type: "umlEdge",
        data: { relationship: "realization" }
      },
      {
        id: "st-e3",
        source: "strat-concrete-b",
        target: "strat-interface",
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
        position: { x: 420, y: 150 },
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
        position: { x: 420, y: 320 },
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
        type: "umlEdge",
        data: { relationship: "composition", label: "notifies" }
      },
      {
        id: "ob-e2",
        source: "obs-concrete-a",
        target: "obs-interface",
        type: "umlEdge",
        data: { relationship: "realization" }
      }
    ]
  }
];

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const users = [
    {
        id: 1,
        password: 'password123',
        email: 'john.doe@example.com'
    },
    {
        id: 2,
        password: 'password456',
        email: 'jane.smith@example.com'
    }
];

const products = [
    { id: 1, name: 'Test 1', category: 'Category 1', description: 'Description of Product 1' },
    { id: 2, name: 'Test 2', category: 'Category 2', description: 'Description of Product 2' },
    { id: 3, name: 'Test 3', category: 'Category 3', description: 'Description of Product 3' },
    { id: 4, name: 'Test 4', category: 'Category 4', description: 'Description of Product 4' },
    { id: 5, name: 'Test 5', category: 'Category 5', description: 'Description of Product 5' }
];

// =========================================================================
// MIDDLEWARE DE PROTECTION (Vérification du Jeton)
// =========================================================================
const authentifierJeton = (req, res, next) => {
    // 1. Récupérer l'en-tête d'autorisation
    const authHeader = req.headers['authorization'];
    
    // 2. Extraire le jeton (Format attendu: "Bearer <TOKEN>")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Si aucun jeton n'est fourni -> Erreur 401 (Non autorisé)
    if (!token) {
        return res.status(401).json({ message: 'Accès refusé : Jeton manquant' });
    }

    // 4. Vérifier la validité et l'expiration du jeton
    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Jeton invalide ou expiré' });
        }
        
        // Si tout est bon, on attache l'utilisateur à la requête et on passe à la suite
        req.user = user;
        next();
    });
};

// =========================================================================
// ROUTE D'AUTHENTIFICATION (Génération du Jeton)
// =========================================================================
app.post('/login', (req, res) => {
    const user = users.find((u) => u.email === req.body.email);
    
    // Utilisation d'un statut 401 générique pour des raisons de sécurité
    if (!user || user.password !== req.body.password) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    // Génération du jeton avec une expiration stricte de 5 minutes ('5m')
    const token = jwt.sign(
        { id: user.id, email: user.email }, 
        'secret_key', 
        { expiresIn: '5m' }
    );

    res.json({ token: token });
});

// =========================================================================
// ROUTES DES PRODUITS (Lecture : Publique | Écriture : Protégée)
// =========================================================================

// Lister tous les produits (Public)
app.get('/products', (req, res) => {
    res.json(products);
});

// Consulter un produit par son id (Public)
app.get('/products/:id', (req, res) => {
    const product = products.find((p) => p.id === Number(req.params.id));

    if (!product) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    res.json(product);
});

// Ajouter un produit (Protégé par le middleware)
app.post('/products', authentifierJeton, (req, res) => {
    const { name, category, description } = req.body;

    if (!name || !category || !description) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const newProduct = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        name,
        category,
        description,
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// Remplacer complètement un produit (Protégé par le middleware)
app.put('/products/:id', authentifierJeton, (req, res) => {
    const productIndex = products.findIndex((p) => p.id === Number(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    const { name, category, description } = req.body;

    if (!name || !category || !description) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    products[productIndex] = {
        id: Number(req.params.id),
        name,
        category,
        description,
    };

    res.json(products[productIndex]);
});

// Modifier partiellement un produit (Protégé par le middleware)
app.patch('/products/:id', authentifierJeton, (req, res) => {
    const productIndex = products.findIndex((p) => p.id === Number(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    products[productIndex] = {
        ...products[productIndex],
        ...req.body,
    };

    res.json(products[productIndex]);
});

// Supprimer un produit (Protégé par le middleware)
app.delete('/products/:id', authentifierJeton, (req, res) => {
    const productIndex = products.findIndex((p) => p.id === Number(req.params.id));

    if (productIndex === -1) {
        return res.status(404).json({ message: 'Produit introuvable' });
    }

    const [deletedProduct] = products.splice(productIndex, 1);
    res.json({ message: 'Produit supprimé', product: deletedProduct });
});

app.listen(3000, () => {
    console.log('Serveur lancé sur le port 3000');
});
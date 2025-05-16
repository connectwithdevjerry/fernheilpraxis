import React from 'react'

const AllPrescribtion = ({ recipes, onSelectRecipe }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">All Prescriptions</h2>
      <ul className="list-none space-y-2">
        {recipes.map((recipe, index) => (
          <li
            key={index}
            className="p-3 bg-gray-100 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200"
            onClick={() => onSelectRecipe(recipe)}
          >
            <p className="text-gray-800 font-semibold">{recipe.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllPrescribtion
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    public function index()
    {
        $employees = Employee::with('user')->paginate(15);
        
        return Inertia::render('Admin/Employees/Index', [
            'employees' => $employees,
        ]);
    }

    public function create()
    {
        $users = User::doesntHave('employee')->get();
        
        return Inertia::render('Admin/Employees/Create', [
            'users' => $users
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id|unique:employees,user_id',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'base_salary' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'admission_date' => 'nullable|date',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:Masculino,Feminino,Outro',
            'academic_level' => 'nullable|string|max:255',
            'nuit' => 'nullable|string|max:20',
            'bi_number' => 'nullable|string|max:20',
            'status' => 'required|string|in:active,inactive,vacation,terminated',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:2048', // 2MB Max
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('employees', 'public');
            $validated['photo_path'] = $path;
        }

        Employee::create($validated);

        return redirect()->route('admin.employees.index')->with('success', 'Funcionário criado com sucesso.');
    }

    public function edit(Employee $employee)
    {
        $users = User::doesntHave('employee')->orWhere('id', $employee->user_id)->get();

        return Inertia::render('Admin/Employees/Edit', [
            'employee' => $employee,
            'users' => $users
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id|unique:employees,user_id,' . $employee->id,
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'position' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'base_salary' => 'nullable|numeric|min:0',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'admission_date' => 'nullable|date',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:Masculino,Feminino,Outro',
            'academic_level' => 'nullable|string|max:255',
            'nuit' => 'nullable|string|max:20',
            'bi_number' => 'nullable|string|max:20',
            'status' => 'required|string|in:active,inactive,vacation,terminated',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('employees', 'public');
            $validated['photo_path'] = $path;
        }

        $employee->update($validated);

        return redirect()->route('admin.employees.index')->with('success', 'Funcionário atualizado com sucesso.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return redirect()->back()->with('success', 'Funcionário removido com sucesso.');
    }
}
